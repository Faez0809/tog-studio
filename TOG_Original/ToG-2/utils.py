import json  # Imports JSON tools so datasets and output records can be loaded/saved.
import time  # Imports time utilities so LLM retry logic can wait before trying again.
import openai  # Imports the OpenAI package used to call GPT-style models for ToG-2 reasoning.
import re  # Imports regular expressions for extracting answers, scores, and brace-marked text from LLM output.
import os  # Imports operating-system helpers used here to check whether output files already exist.
from prompt_list import *  # Imports all prompt templates used for QA, fact checking, self-consistency, and query reformulation.
from rank_bm25 import BM25Okapi  # Imports BM25, a keyword-based retrieval model used as a non-neural ranker.
from sentence_transformers import util  # Imports similarity utilities for embedding-based document ranking.
from openai import OpenAI  # Imports the OpenAI client class, also used for local OpenAI-compatible LLaMA servers.


# --- Step: Embedding-Based Retrieval ---
# Role in ToG-2: rank retrieved Wikipedia documents/passages by how relevant they are to the question.
# Inputs: a query string, a list of documents, an embedding model, and the number of top documents to keep.
# Outputs: the top documents and their similarity scores.
def retrieve_top_docs(query, docs, model, width=3):
    query_emb = model.encode(query)  # Converts the question/query text into a vector embedding.
    doc_emb = model.encode(docs)  # Converts every candidate document/passage into vector embeddings.

    scores = util.dot_score(query_emb, doc_emb)[0].cpu().tolist()  # Computes similarity between the question vector and each document vector.

    doc_score_pairs = sorted(list(zip(docs, scores)), key=lambda x: x[1], reverse=True)  # Pairs each document with its score and sorts best-first.

    top_docs = [pair[0] for pair in doc_score_pairs[:width]]  # Keeps only the top-ranked documents for retrieval evidence.
    top_scores = [pair[1] for pair in doc_score_pairs[:width]]  # Keeps the matching scores so later code can inspect confidence.

    return top_docs, top_scores  # Returns the most relevant documents and scores for downstream LLM reasoning.


# --- Step: BM25 Retrieval ---
# Role in ToG-2: provide keyword-based similarity when neural embedding models are not used.
def compute_bm25_similarity(query, corpus):

    tokenized_corpus = [doc.split(" ") for doc in corpus]  # Splits each document into simple space-separated tokens for BM25.
    bm25 = BM25Okapi(tokenized_corpus)  # Builds a BM25 index over the candidate documents.
    tokenized_query = query.split(" ")  # Splits the question into tokens so BM25 can compare it with documents.

    doc_scores = bm25.get_scores(tokenized_query)  # Scores every document by keyword overlap and BM25 weighting.

    return doc_scores  # Returns one relevance score per document.


# --- Step: Score Utility ---
def if_all_zero(topn_scores):
    return all(score == 0 for score in topn_scores)  # Returns True only when every score is zero, meaning the ranker found no preference.


# --- Step: Formatting Relation Candidates ---
# Role in ToG-2: convert raw relation names and scores into structured records used during graph traversal.
def clean_relations_bm25_sent(topn_relations, topn_scores, entity_id, head_relations):
    relations = []  # Starts an empty list that will hold relation dictionaries.
    if if_all_zero(topn_scores):  # If BM25 gave all zero scores, no relation is clearly better than the others.
        topn_scores = [float(1/len(topn_scores))] * len(topn_scores)  # Assigns equal scores so relation ranking still has usable values.
    i=0  # Creates an index used to match each relation with its score.
    for relation in topn_relations:  # Converts each selected relation into a structured dictionary.
        if relation in head_relations:  # Checks whether this relation is connected on the head side of the entity.
            relations.append({"entity": entity_id, "relation": relation, "score": topn_scores[i], "head": True})  # Marks the relation direction as head=True for later entity expansion.
        else:  # If the relation is not in head_relations, treat it as tail-side.
            relations.append({"entity": entity_id, "relation": relation, "score": topn_scores[i], "head": False})  # Marks direction as head=False so search expands the correct side of the graph edge.
        i+=1  # Moves to the next score for the next relation.
    return True, relations  # Returns a success flag and the cleaned relation list.


# --- Step: General LLM Call ---
# Role in ToG-2: send prompts to GPT or a local LLaMA-compatible server for reasoning, pruning, and fallback answering.
# Inputs: prompt text, temperature, max token limit, API key, model name, and number of completions.
# Output: one text response, or the full response object when n > 1 for self-consistency.
def run_llm(prompt, temperature, max_tokens, opeani_api_keys, engine="gpt-3.5-turbo", n=1):

    if "llama" in engine.lower():  # If the engine name contains "llama", use a local OpenAI-compatible server.
        openai_api_key = "EMPTY"  # Local servers often ignore API keys, so a placeholder is used.
        openai_api_base = "http://localhost:7788/v1"  # Points to the local LLaMA/vLLM-style API endpoint.

        client = OpenAI(
            api_key=openai_api_key,
            base_url=openai_api_base,
        )  # Creates a client connected to the local LLaMA-compatible server.

        models = client.models.list()  # Asks the local server which model is currently available.
        engine = models.data[0].id  # Uses the first available local model ID for the chat completion call.
        print(engine)  # Logs the selected local model name for debugging.
    else:  # Otherwise, use the configured OpenAI-compatible remote endpoint.
        client = openai.OpenAI(api_key=opeani_api_keys, base_url="<your_api_url>")  # Creates a GPT client using the provided API key and base URL.


    sys_prompt = '''You are a helpful assistant'''  # Sets the system role so the LLM behaves like a helpful assistant.
    messages = [{"role":"system","content":sys_prompt}]  # Starts the chat message list with the system instruction.
    message_prompt = {"role":"user","content":prompt}  # Wraps the actual ToG-2 prompt as a user message.
    messages.append(message_prompt)  # Adds the user prompt to the messages sent to the LLM.

    f = 4  # Allows up to four attempts so temporary API failures do not immediately stop the run.
    while(f > 0):  # Repeats until a response succeeds or all retry attempts are used.
        if f == 2:  # When half the retries are gone, switch to a longer-context model.
            engine = "gpt-3.5-turbo-16k"    # In case of too long input
        try:  # Attempts the chat completion API call.
                response = client.chat.completions.create(
                        model=engine,
                        messages = messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        frequency_penalty=0,
                        presence_penalty=0,
                        n=n)  # Sends the prompt to the LLM with the requested decoding settings.
                if n > 1:  # Self-consistency needs multiple completions, so it returns the raw response object.
                    return response  # Returns all completions for later vote/count logic.
                else:  # Normal ToG-2 calls only need one answer string.
                    result = response.choices[0].message.content  # Extracts the generated text from the first completion.
                f = -1  # Marks the retry loop as complete after success.
                return result  # Returns the generated answer/reasoning text.
        except Exception as e:  # Catches API, network, model, or context-length failures.
            print(e)  # Logs the error so the experimenter can diagnose failed calls.
            time.sleep(10)  # Waits before retrying to avoid hammering the API/server.
            f -= 1  # Uses one retry attempt.
    return ''  # Returns an empty string if every LLM attempt failed.


# --- Step: Chinese Finance LLM Call ---
# Role in ToG-2 variants: call an LLM with a Chinese finance-specific system prompt.
def run_llm_cnfin(prompt, temperature, max_tokens, opeani_api_keys, engine="gpt-3.5-turbo", n=1):

    if "llama" in engine.lower():  # Uses a local OpenAI-compatible LLaMA server when requested.
        openai_api_key = "EMPTY"  # Uses a placeholder key because local servers may not require a real key.
        openai_api_base = "http://localhost:7788/v1"  # Local model server endpoint.

        client = OpenAI(
            api_key=openai_api_key,
            base_url=openai_api_base,
        )  # Creates the local LLM client.

        models = client.models.list()  # Lists available local models.
        engine = models.data[0].id  # Selects the first local model returned by the server.
        print(engine)  # Logs the selected model.
    else:  # Uses a remote OpenAI-compatible endpoint for GPT-style calls.
        client = openai.OpenAI(api_key=opeani_api_keys, base_url="https://api.gptsapi.net/v1")  # Creates the remote client for the finance variant.

    sys_prompt = '''ä½ æ˜¯ä¸€ä¸ªä¸“ä¸šçš„ä¸­æ–‡é‡‘èžåŠ©æ‰‹ï¼Œè¢«è®¾è®¡ç”¨äºŽä»¥JSONå½¢å¼å›žç­”é—®é¢˜.'''  # Sets a Chinese finance assistant system prompt, kept exactly as in the original file.
    messages = [{"role":"system","content":sys_prompt}]  # Starts the chat with the finance-specific system instruction.
    message_prompt = {"role":"user","content":prompt}  # Wraps the user/task prompt for the LLM.
    messages.append(message_prompt)  # Adds the task prompt to the chat messages.

    f = 4  # Allows multiple retry attempts for temporary API failures.
    while(f > 0):  # Keeps trying until success or until retries are exhausted.
        if f == 2:  # Switches model after two failed attempts.
            engine = "gpt-3.5-turbo-16k"  # Uses a longer-context model when the prompt may be too long.
        try:  # Attempts the LLM request.
                response = client.chat.completions.create(
                        model=engine,
                        messages = messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        frequency_penalty=0,
                        presence_penalty=0,
                        n=n)  # Sends the finance prompt to the chat completion endpoint.
                if n > 1:  # Multiple completions are returned as a full object for later self-consistency logic.
                    return response  # Returns all sampled completions.
                else:  # Single completion mode returns just generated text.
                    result = response.choices[0].message.content  # Extracts text from the first completion.
                f = -1  # Ends the retry loop after success.
                return result  # Returns the generated finance response.
        except Exception as e:  # Catches request or model errors.
            print(e)  # Prints the error for debugging.
            time.sleep(10)  # Waits before retrying.
            f -= 1  # Decreases the remaining retry count.
    return ''  # Returns empty text if all attempts fail.


# --- Step: Entity Candidate Cleanup ---
def all_unknown_entity(entity_candidates):
    return all(candidate == "UnName_Entity" for candidate in entity_candidates)  # Checks whether every candidate entity is an unknown placeholder.


def del_unknown_entity(entity_candidates):
    if len(entity_candidates)==1 and entity_candidates[0]=="UnName_Entity":  # If the only candidate is unknown, keep it to preserve the fact that something was returned.
        return entity_candidates  # Returns the original single unknown entity list.
    entity_candidates = [candidate for candidate in entity_candidates if candidate != "UnName_Entity"]  # Removes unknown placeholders when real candidate entities exist.
    return entity_candidates  # Returns the cleaned candidate list for entity expansion/ranking.


# --- Step: Cleaning LLM-Generated Scores ---
def clean_scores(string, entity_candidates):
    scores = re.findall(r'\d+\.\d+', string)  # Extracts decimal numbers from an LLM response, such as "0.85".
    scores = [float(number) for number in scores]  # Converts extracted score strings into floats.
    if len(scores) == len(entity_candidates):  # Checks whether the LLM produced exactly one score per entity candidate.
        return scores  # Uses the parsed scores when the count matches the candidates.
    else:  # If parsing failed or counts do not match, use a safe fallback.
        print("All entities are created equal.")  # Logs that no reliable score distribution was found.
        return [1/len(entity_candidates)] * len(entity_candidates)  # Assigns equal probability/importance to every entity candidate.


# --- Step: Saving ToG-2 Results ---
# Role in ToG-2: store question, answer, evidence sentences, graph paths, and stop reason for later evaluation.
def save_2_jsonl(question,ground_truth, answer, time_cost, search_entity_list,total_related_senteces,  cluster_chain_of_entities, file_name,end_mode,remark):

    sorted_sentences = sorted(total_related_senteces, key=lambda x: x['score'], reverse=True)  # Sorts retrieved evidence by score so the strongest sentences are shown first.

    data_dict = {"question":question,'ground_truth':ground_truth,'results':answer,'time_cost':time_cost,'end_mode':end_mode,'remark':remark,'top_5_sentences':sorted_sentences[0:5],"search_entity_list":search_entity_list,"cluster_chain_of_entities":cluster_chain_of_entities}  # Packs the full example result into one JSON-serializable dictionary.
    filename="ToG_{}.json".format(file_name)  # Builds the output filename for this dataset/run.

    if os.path.exists(filename):  # If the output file already exists, append this new result into the existing JSON array.

        with open(filename, "r") as f:  # Opens the existing output file for reading.
            content = f.read()  # Reads the current JSON text.
            if content.endswith("]"):  # If the file already contains a closed JSON array, insert a comma before the final bracket.
                content = content.strip().rstrip("]")  # Removes whitespace and the final closing bracket.
                content += "," + json.dumps(data_dict, indent=4) + "]"  # Appends the new record and closes the JSON array again.
            else:  # If the existing file is malformed or incomplete, rebuild it as a one-item array.
                content = "["+json.dumps(data_dict, indent=4) + "]"  # Creates a fresh JSON array containing this result.
    else:  # If there is no output file yet, create the first JSON array.
        content = "["+json.dumps(data_dict, indent=4) + "]"  # Creates a JSON array with the current example as the first item.

    with open(filename, "w") as f:  # Opens the output file for writing the updated JSON content.
        f.write(content)  # Writes the full JSON text back to disk.


# --- Step: Extracting Braced Answers ---
def extract_answer(text):
    start_index = text.find("{")  # Finds the first opening brace in the LLM output.
    end_index = text.find("}")  # Finds the first closing brace in the LLM output.
    if start_index != -1 and end_index != -1:  # Checks that both braces exist.
        return text[start_index+1:end_index].strip()  # Returns the text inside braces, often the final answer label.
    else:  # If no braced answer exists, return empty text.
        return ""  # Signals that answer extraction failed.


# --- Step: Yes/No Parsing ---
def if_true(prompt):
    if prompt.lower().strip().replace(" ","")=="yes":  # Normalizes the LLM/user text and checks whether it exactly means "yes".
        return True  # Returns True for yes.
    return False  # Returns False for anything other than yes.


# --- Step: LLM-Only Generation With CoT Prompt ---
def generate_without_explored_paths(question, args):
    prompt = cot_prompt + "\n\nQ: " + question + "\nA:"  # Builds a chain-of-thought QA prompt without graph paths or retrieved entities.
    response = run_llm(prompt, args.temperature_reasoning, args.max_length, args.opeani_api_keys, args.LLM_type)  # Asks the LLM to answer using only its internal knowledge.
    return response  # Returns the LLM-only answer.


# --- Step: LLM Generation Using Retrieved Sentences ---
def generate_only_with_sentences(question,Total_Related_Senteces, args):

    sorted_sentences = sorted(Total_Related_Senteces, key=lambda x: x['score'], reverse=True)  # Sorts retrieved Wikipedia evidence by relevance score.
    texts = [sentence['text'] for sentence in sorted_sentences[0:5]]  # Keeps the top five evidence sentences to control prompt length.
    related_sentences_prompt = '\n'.join(texts)  # Joins the selected evidence sentences into one prompt block.

    prompt = only_with_sentences_prompt + "\n\nQ: " + question +'\nRelated Information: \n' + related_sentences_prompt+"\nA:"  # Builds a prompt that tells the LLM to answer using retrieved sentences.

    response = run_llm(prompt, args.temperature_reasoning, args.max_length, args.opeani_api_keys, args.LLM_type)  # Calls the LLM with evidence but without graph path reasoning.
    return response  # Returns the generated answer.


# --- Step: Query Reformulation With Clues ---
def query_reformulate_clue(original_question, answer,args):
    curly_braces_pattern = re.compile(r'\{\{(.*?)\}\}')  # Compiles a pattern for text inside double braces, used as a clue marker.

    curly_braces_matches = curly_braces_pattern.findall(answer)  # Extracts all double-brace clue candidates from the LLM answer.
    if len(curly_braces_matches) == 0 or len(curly_braces_matches[0]) > 2:  # If no short yes/no-style marker appears, the clue format is not valid.
        print("The output does not contain enough curly brace enclosed contents(0):", answer)  # Logs malformed LLM output.
        return original_question  # Falls back to the original query so retrieval remains stable.
    elif len(curly_braces_matches) == 1 and (curly_braces_matches[0].lower() in ["no", "yes"]):  # If the only marker is yes/no, there is no extra search clue.
        print("The output does not contain enough curly brace enclosed contents(1):", answer)  # Logs that no useful reformulation clue was found.
        return original_question  # Keeps the original query.
    else:  # If a useful clue appears, ask the LLM to reformulate the query.
        prompt = prompt_rq.format(original_question, answer)  # Inserts the original question and clue-bearing answer into a reformulation prompt.
        response = run_llm(prompt, 0, 20, args.opeani_api_keys, args.LLM_type)  # Generates a short deterministic reformulated query.
        match = re.search(r'\{(.*?)\}', response)  # Extracts the reformulated query from single braces.
        return match.group(1) if match else original_question  # Uses the reformulation if found, otherwise falls back to the original question.


# --- Step: Query Reformulation By Appending Clue Text ---
def query_reformulate_add(original_question, answer):
    curly_braces_pattern = re.compile(r'\{\{(.*?)\}\}')  # Compiles a pattern for double-brace clue text in the answer.

    curly_braces_matches = curly_braces_pattern.findall(answer)  # Extracts clue candidates from the answer.
    if len(curly_braces_matches) == 0 or len(curly_braces_matches[0]) > 2:  # If no valid short marker appears, the expected clue format is missing.
        print("The output does not contain enough curly brace enclosed contents(0):", answer)  # Logs the malformed answer.
        return original_question  # Keeps the original retrieval query.
    elif len(curly_braces_matches) == 1 and (curly_braces_matches[0].lower() in ["no", "yes"]):  # If only yes/no exists, no extra clue can be appended.
        print("The output does not contain enough curly brace enclosed contents(1):", answer)  # Logs that the answer lacks a useful clue.
        return original_question  # Keeps the original query.
    else:  # If clue text exists, use it directly.
        return original_question + curly_braces_matches[-1]  # Appends the last clue to the original question to guide later retrieval/search.


# --- Step: Finance Search Mode Parsing ---
def dynamic_requery_fin(answer):
   if "æ·±åº¦æœç´¢" in answer:  # Checks whether the finance answer requests depth-first/deeper search, preserving the original encoded string.
       return "æ·±åº¦æœç´¢"  # Returns the depth-search mode string.
   else:  # If the depth-search phrase is absent, choose the other search mode.
       return "å¹¿åº¦æœå¼±"  # Returns the breadth-style search mode string.


# --- Step: Dataset-Aware LLM-Only Fallback ---
def generate_only_with_gpt(question, args):
    if 'fever' in args.dataset:  # FEVER is a claim verification dataset, so it needs a FEVER-style prompt.
        prompt = fever_s1_prompt_demonstration_6_shot + question + "\nAnswer:"  # Builds a FEVER few-shot prompt for label-style answers.
    elif "creak" in args.dataset:  # CREAK is also a fact-checking dataset.
        prompt = vanilla_prompt_fact_check_3shot + question + "\nAnswer:"  # Builds a fact-checking prompt for true/false-style reasoning.
    else:  # Other datasets are treated as open-domain question answering.
        prompt = cot_prompt + question + "\nAnswer:"  # Builds a chain-of-thought QA prompt.

    response = run_llm(prompt, args.temperature_reasoning, args.max_length, args.opeani_api_keys, args.LLM_type)  # Calls the LLM without graph traversal or Wikipedia expansion.
    return response  # Returns the fallback answer.


# --- Step: Self-Consistency Reasoning ---
# Role in ToG-2: ask the LLM multiple times before graph traversal and trust it early if many answers agree.
# Inputs: question text, dataset record, record index, and run arguments.
# Output: the dataset record enriched with self-consistency score, response, and answer.
def self_consistency(question, data, idx, args):
    def get_s1_prompt(question, args):  # Builds the stage-1 prompt used for self-consistency sampling.
        if 'fever' not in args.dataset:  # Non-FEVER datasets use the HotpotQA-style QA demonstration prompt.
            return hotpotqa_s1_prompt_demonstration + "Q: " + question.strip() + "\nA: "  # Formats the question as a QA example.
        else:  # FEVER uses a claim-verification prompt.
            return fever_s1_prompt_demonstration + "Q: " + question.strip() + "\nA: "  # Formats the claim/question for FEVER-style reasoning.

    def get_cot_sc_results(data_point, cot_prompt, args, k = 10):  # Runs multiple chain-of-thought completions and measures agreement.
        cot_sc_responses = run_llm(cot_prompt, 0.7, args.max_length, args.opeani_api_keys, args.LLM_type, n=10)  # Samples 10 LLM answers with higher temperature for diversity.

        if cot_sc_responses is not None:  # Checks that the API call returned a response object.
            all_cot_text_response = [choice.message.content.strip() for choice in cot_sc_responses.choices]  # Extracts text from every sampled completion.
            all_cot_results = []  # Stores normalized final answers extracted from the completions.

            for x in all_cot_text_response:  # Processes each sampled reasoning response.
                if "The answer is" in x:  # Looks for the standard final-answer phrase in the completion.
                    all_cot_results.append(x.split("The answer is")[1].strip().lower())  # Extracts and normalizes the answer after that phrase.
                else:  # If the response lacks the expected phrase, it cannot be counted.
                    None  # Keeps the original no-op behavior unchanged.

            all_cot_results = all_cot_results[:k]  # Uses at most k extracted answers for the self-consistency vote.
            if len(all_cot_results) > 0:  # If at least one usable answer was extracted, compute agreement.
                most_common_answer = max(set(all_cot_results), key=all_cot_results.count)  # Finds the answer that appears most often.
                most_common_answer_indices = [i for i, x in enumerate(all_cot_results) if x == most_common_answer]  # Finds which samples produced that majority answer.
                sc_score = float(len(most_common_answer_indices)) / k  # Computes agreement as majority-count divided by k.
                cot_answer = all_cot_results[0]  # Stores the first extracted answer, though the variable is not used later in this function.
                cot_sc_text_response = all_cot_text_response[most_common_answer_indices[0]]  # Keeps one full reasoning response that produced the majority answer.
                cot_sc_answer = most_common_answer  # Stores the majority answer itself.
            else:  # If no answer could be extracted, self-consistency confidence is zero.
                cot_sc_answer = ""  # Stores an empty majority answer.
                cot_sc_text_response = 'No answer found'  # Records that no usable completion format was found.
                sc_score = 0  # Sets confidence to zero so main_tog2.py will not trust this early.

        else:  # If the LLM call failed entirely, stop because stage 1 cannot be computed.
            raise Exception("Stage 1: OpenAI API call failed")  # Raises a clear failure message.

        data_point["cot_sc_score"] = sc_score  # Saves the self-consistency agreement score into the dataset record.
        data_point["cot_sc_response"] = cot_sc_text_response  # Saves the full majority reasoning response.
        data_point["cot_sc_answer"] = cot_sc_answer  # Saves the majority final answer.
        return data_point  # Returns the enriched record to main_tog2.py.

    def s1_reasoning_preparation(question, data_point,args):  # Prepares and runs stage-1 self-consistency reasoning.
        print("****************** Start stage 1: reasoning preparation ...")  # Logs the beginning of self-consistency.
        print("****** Question:", question)  # Logs the current question being sampled.

        cot_prompt = get_s1_prompt(question, args)  # Builds the dataset-specific prompt for self-consistency.

        data_point = get_cot_sc_results(data_point, cot_prompt, args)  # Runs the sampled LLM calls and stores agreement results.

        print("****** CoT SC score:", data_point["cot_sc_score"])  # Logs the agreement score used by main_tog2.py for early stopping.


        return data_point  # Returns the record with self-consistency fields added.

    data_point = data  # Uses the current dataset example as the object that will receive self-consistency fields.
    data_point["id"] = idx  # Stores the dataset index for traceability in outputs.
    if 'cot_sc_score' not in data_point:  # Avoids recomputing self-consistency if the record already has a score.
        data_point = s1_reasoning_preparation(question, data_point,args)  # Runs stage-1 LLM self-consistency for this question.

        with open(args.output, "w") as f:  # Opens the configured output/cache file for writing.
            json.dump(data_point, f)  # Saves the enriched record so the self-consistency result can be inspected or reused.
    return data_point  # Returns the record to the main ToG-2 pipeline.


# --- Step: Finish Marker Handling ---
def if_finish_list(lst):
    if all(elem == "[FINISH_ID]" for elem in lst):  # Checks whether every selected next-hop entity is the special finish marker.
        return True, []  # Signals that graph traversal should stop because no real QID remains.
    else:  # If some real QIDs remain, remove only the finish markers.
        new_lst = [elem for elem in lst if elem != "[FINISH_ID]"]  # Filters out finish markers while keeping expandable entity QIDs.
        return False, new_lst  # Signals traversal can continue and returns the remaining QIDs.


# --- Step: Loading Dataset ---
# Role in ToG-2: choose the correct data file and question field for the requested benchmark.
# Input: dataset name from command-line args.
# Output: loaded data records and the key that contains the question/claim text.
def prepare_dataset(dataset_name):

    if dataset_name == 'cwq':  # Handles the ComplexWebQuestions dataset.
        with open('../data/cwq.json',encoding='utf-8') as f:  # Opens the CWQ JSON data file.
            datas = json.load(f)  # Loads all dataset examples into Python objects.
        question_string = 'question'  # CWQ stores question text under the "question" key.
    elif dataset_name == 'hotpot_e':  # Handles the HotpotQA entity-annotated dataset used in this project.
        with open('../data/hotpotadv_entities_azure.json',encoding='utf-8') as f:  # Opens the HotpotQA-style entity file.
            datas = json.load(f)  # Loads examples with questions and topic entities/QIDs.
        question_string = 'question'  # Hotpot examples use the "question" field.
    elif dataset_name == 'fever':  # Handles the FEVER claim verification dataset.
        with open('../data/fever_1000_entities_azure.json', encoding='utf-8') as f:  # Opens FEVER examples with entity annotations.
            datas = json.load(f)  # Loads FEVER claim records.
        question_string = 'claim'  # FEVER uses "claim" instead of "question".
    elif dataset_name == 'webqsp':  # Handles the WebQuestionsSP dataset.
        with open('../data/webqsp_test.json', encoding='utf-8') as f:  # Opens the WebQSP test data file.
            datas = json.load(f)  # Loads WebQSP question records.
        question_string = 'question'  # WebQSP stores the question text under "question".
    elif dataset_name == 'grailqa':  # Handles the GrailQA dataset.
        with open('../data/grailqa.json',encoding='utf-8') as f:  # Opens the GrailQA data file.
            datas = json.load(f)  # Loads GrailQA examples.
        question_string = 'question'  # GrailQA uses the "question" field.
    elif dataset_name == 'simpleqa':  # Handles the SimpleQA dataset.
        with open('../data/SimpleQA.json',encoding='utf-8') as f:  # Opens the SimpleQA data file.
            datas = json.load(f)  # Loads SimpleQA examples.
        question_string = 'question'  # SimpleQA uses the "question" field.
    elif dataset_name == 'qald':  # Handles the QALD dataset.
        with open('../data/qald_10-en.json',encoding='utf-8') as f:  # Opens the English QALD-10 data file.
            datas = json.load(f)  # Loads QALD examples.
        question_string = 'question'  # QALD uses the "question" field.
    elif dataset_name == 'webquestions':  # Handles the original WebQuestions dataset.
        with open('../data/WebQuestions.json',encoding='utf-8') as f:  # Opens WebQuestions data.
            datas = json.load(f)  # Loads WebQuestions examples.
        question_string = 'question'  # WebQuestions uses the "question" field.
    elif dataset_name == 'trex':  # Handles the T-REx relation extraction dataset.
        with open('../data/T-REX.json',encoding='utf-8') as f:  # Opens the T-REx data file.
            datas = json.load(f)  # Loads T-REx records.
        question_string = 'input'  # T-REx stores text under "input".
    elif dataset_name == 'zeroshotre':  # Handles the Zero-Shot Relation Extraction dataset.
        with open('../data/Zero_Shot_RE.json',encoding='utf-8') as f:  # Opens the Zero-Shot RE data file.
            datas = json.load(f)  # Loads relation extraction examples.
        question_string = 'input'  # Zero-Shot RE stores text under "input".
    elif dataset_name == 'creak':  # Handles the CREAK commonsense fact-checking dataset.
        with open('../data/creak.json',encoding='utf-8') as f:  # Opens CREAK records.
            datas = json.load(f)  # Loads CREAK examples.
        question_string = 'sentence'  # CREAK stores the claim/sentence under "sentence".
    elif dataset_name == 'finkg_qa':  # Handles a financial knowledge graph QA dataset.
        with open('../data/finkg_qa.json', encoding='utf-8') as f:  # Opens the finance KG QA data file.
            datas = json.load(f)  # Loads finance QA examples.
        question_string = 'question'  # Finance QA uses the "question" field.
    else:  # Handles any dataset name not supported by this function.
        print("Dataset not found.")  # Prints a clear error message.
        exit(-1)  # Stops the program because ToG-2 cannot run without a known dataset file.
    return datas, question_string  # Returns the loaded dataset and the field name main_tog2.py should read as the query.
