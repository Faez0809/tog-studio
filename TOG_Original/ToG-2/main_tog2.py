import argparse  # Imports Python's command-line argument parser so this script can be configured without editing code.
import statistics  # Imports statistics tools; this file may rely on them through earlier experiment code or helper usage.
from pathlib import Path  # Imports Path for filesystem paths; useful for dataset/output paths in the ToG-2 project.
from client import *  # Imports Wikidata client classes, especially the multi-server client used to query QIDs and relations.
from utils import *  # Imports dataset, prompting, saving, and reasoning helpers used throughout the ToG-2 pipeline.
from search import *  # Imports graph search helpers for relation search, entity expansion, ranking, and pruning.
import urllib3  # Imports urllib3 so HTTPS warning behavior can be controlled for local/remote Wikidata servers.
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)  # Hides insecure HTTPS warnings that can appear when querying the Wikidata service.
import torch  # Imports PyTorch, mainly because embedding/reranking models may depend on GPU/torch execution.
from wiki_func import *  # Imports Wikipedia retrieval helpers used to fetch and rank passages for entities.


# --- Step: Parsing Command-Line Arguments ---
parser = argparse.ArgumentParser()  # Creates an argument parser so experiment settings can be passed from the terminal.

parser.add_argument("--dataset", type=str,
                    default="hotpot_e", help="choose the dataset.")  # Chooses which QA/claim dataset to load for ToG-2 evaluation.
parser.add_argument("--samples", type=int,
                    default=2000, help="choose the number of samples.")  # Limits how many dataset examples are processed in one run.
parser.add_argument("--start", type=int,
                    default=0, help="choose the start number of samples.")  # Lets the run resume from a later dataset index.
parser.add_argument("--max_length", type=int, help="the max length of LLMs output.")  # Sets the maximum generated answer length for the LLM.
parser.add_argument("--temperature_exploration", type=float,
                    default=0, help="the temperature in exploration stage.")  # Controls randomness when the LLM helps explore graph relations.
parser.add_argument("--temperature_reasoning", type=float,
                    default=0, help="the temperature in reasoning stage.")  # Controls randomness when the LLM produces final reasoning/answers.
parser.add_argument("--width", type=int,
                    default=3, help="choose the search width of ToG.")  # Sets how many top entities/paths are kept during graph traversal.
parser.add_argument("--depth", type=int,
                    default=3, help="choose the search depth of ToG.")  # Sets how many graph hops ToG-2 explores from the topic entities.
parser.add_argument("--remove_unnecessary_rel", type=bool,
                    default=True, help="whether removing unnecessary relations.")  # Enables filtering relations that are unlikely to help answer the question.
parser.add_argument("--LLM_type", type=str,
                    default='gpt-3.5-turbo', choices=['gpt-3.5-turbo', 'llama','gpt-4o'], help="base LLM model.")  # Selects the LLM used for normal generation/reasoning calls.
parser.add_argument("--LLM_type_rp", type=str,
                    default="gpt-3.5-turbo", choices=["gpt-3.5-turbo-16k",'gpt-4o'],help="base LLM model.")  # Selects the LLM used for relation pruning prompts.
parser.add_argument("--opeani_api_keys", type=str,
                    default='<your_api_key>',
                    help="if the LLM_type is gpt-3.5-turbo or gpt-4, you need add your own openai api keys.")  # Stores the API key used by LLM helper functions.
parser.add_argument("--addr_list", type=str,
                    default="server_urls.txt", help="The address of the Wikidata service.")  # Points to the file containing Wikidata server URLs.
parser.add_argument("--embedding_model_name", type=str, default="bge-bi")  # Chooses the embedding/ranking model for retrieval and entity ranking.
parser.add_argument("--relation_prune", type=bool, default=True, help="whether to prune the relation")  # Enables pruning so ToG-2 searches only promising relations.
parser.add_argument("--relation_prune_combination", type=bool, default=True,
                    help="whether to combine the relation prune")  # Enables pruning relations jointly across all topic entities.
parser.add_argument("--num_sents_for_reasoning", type=int, default=10)  # Limits how many retrieved Wikipedia sentences are passed to the reasoning prompt.
parser.add_argument("--topic_prune", type=bool, default=True)  # Enables pruning when too many initial topic entities are detected.
parser.add_argument("--gpt_only", type=bool, default=False)  # If true, skips graph traversal and answers using only the LLM.
parser.add_argument("--self_consistency", type=bool, default=True)  # Enables an early LLM self-consistency check before graph search.
parser.add_argument("--self_consistency_threshold", type=float, default=0.8)  # Sets the confidence score needed to trust self-consistency and skip ToG search.
parser.add_argument("--clue_query", type=bool, default=True)  # Enables clue-based query behavior inside helper functions when supported.


def sliding_window_type(s):  # Defines a custom parser for arguments like "3,2" into a tuple of integers.
    try:  # Tries to parse the user-provided sliding-window string.
        window_size, step_size = map(int, s.split(','))  # Splits "window,step" and converts both parts into integers.
        return window_size, step_size  # Returns a tuple used by retrieval/ranking code for windowed passage handling.
    except:  # Catches bad formats such as "3" or "a,b".
        raise argparse.ArgumentTypeError("Sliding window must be two integers separated by a comma, e.g., 3,2")  # Gives a clear CLI error message.


parser.add_argument(
    'sliding_window',
    type=sliding_window_type,
    help='Specify sliding window size and step size as two integers separated by a comma, e.g., 3,2',
    nargs='?',
    default=(1, 1)
)  # Adds an optional positional argument controlling how text windows are built for retrieval.

args = parser.parse_args()  # Parses the first group of command-line arguments so args.dataset can be used below.
parser.add_argument("--output", type=str, default='{}_self_consistency'.format(args.dataset))  # Adds an output-name argument that depends on the selected dataset.
args = parser.parse_args()  # Parses again so the newly added --output argument is included in args.
start = args.start  # Stores the starting dataset index for the main processing loop.


# --- Step: Loading Dataset ---
datas, question_string = prepare_dataset(args.dataset)  # Loads the selected dataset and returns the key name that contains each question/claim.


# --- Step: GPU / Model Environment ---
os.environ["CUDA_VISIBLE_DEVICES"] = "0"  # Restricts visible CUDA GPUs to GPU 0 for embedding/reranking model execution.
print(f"Available GPU IDs: {os.environ['CUDA_VISIBLE_DEVICES']}")  # Prints which GPU ID this run is allowed to use.


# --- Step: Loading Retrieval / Ranking Model ---
if args.embedding_model_name == "bge-bi":  # Uses a bi-encoder embedding model for fast semantic similarity ranking.
    from FlagEmbedding import FlagModel  # Imports the BGE bi-encoder model class only when this option is chosen.
    print('loading rank model bge embedding model...')  # Logs which ranking model is being loaded.
    emb_model = FlagModel('BAAI/bge-large-en-v1.5', use_fp16=False)  # Loads BGE embeddings for comparing questions with passages/entities.
elif args.embedding_model_name == "minilm":  # Uses a cross-encoder reranker based on MiniLM.
    from sentence_transformers import CrossEncoder  # Imports CrossEncoder only for the MiniLM option.
    print('loading rank model minilm...')  # Logs the selected ranking model.
    emb_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2', max_length=512)  # Loads MiniLM to score question-passage relevance.
elif args.embedding_model_name == "bm25":  # Uses lexical BM25 similarity instead of neural embeddings.
    print('loading rank model bm25...')  # Logs that a keyword-based ranker is selected.
    emb_model = compute_bm25_similarity  # Stores the BM25 scoring function so later code can call it like a ranker.
elif args.embedding_model_name == 'bge-ce':  # Uses a BGE cross-encoder reranker for stronger but slower relevance scoring.
    from FlagEmbedding import FlagReranker  # Imports the BGE reranker class only when needed.
    print("loading rank model bge reranker...")  # Logs the selected reranking model.
    emb_model = FlagReranker('BAAI/bge-reranker-large', use_fp16=False)  # Loads a cross-encoder reranker for precise passage/entity ranking.
elif args.embedding_model_name == 'colbert':  # Uses the ColBERT-style BGE-M3 model for token-level retrieval scoring.
    from FlagEmbedding import BGEM3FlagModel  # Imports the BGE-M3 model class only for this option.
    print("loading rank model Colbert...")  # Logs the selected model.
    emb_model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)  # Loads BGE-M3 with fp16 to speed up retrieval scoring on GPU.

samples_length = args.samples  # Stores the requested number of dataset examples to process.

print("Start Running ToG on %s dataset." % args.dataset)  # Announces the dataset being evaluated.

print('Dataset length: ' + str(len(datas)))  # Shows the total number of loaded examples.

print('Test samples length: ' + str(samples_length))  # Shows how many examples this run will attempt to process.


# --- Step: Connecting To Wikidata Service ---
# wiki_client
with open(args.addr_list, "r") as f:  # Opens the server address list used to contact local/remote Wikidata query services.
    server_addrs = f.readlines()  # Reads every server URL line from the address file.
    server_addrs = [addr.strip() for addr in server_addrs]  # Removes newline/space characters so each URL is clean.
wiki_client = MultiServerWikidataQueryClient(server_addrs)  # Builds a client that can query multiple Wikidata servers for QIDs, labels, relations, and neighbors.
wiki_client.test_connections()  # Checks that the configured Wikidata servers are reachable before graph traversal starts.


# --- Step: ToG-2 Main Pipeline Function ---
# main_wiki_new runs one question through the ToG-2 pipeline:
# input: original_question text, topic_entity dict of QID -> entity label, ground_truth answer, and optional self-consistency data.
# output: generated answer, explored graph/search records, retrieved Wikipedia sentences, entity chains, stop mode, and a remark.
def main_wiki_new(original_question, topic_entity, ground_truth, data_point):
    clue = ''  # Initializes an optional clue string; helpers can use it to guide retrieval/reasoning.
    question = original_question  # Keeps a working copy of the question while preserving the original text.
    print('\n')  # Prints spacing so each example is easier to read in logs.
    print('Question   ' + question)  # Logs the current question/claim being processed.
    print('topic_entity   ' + str(','.join(topic_entity)))  # Logs the initial topic entity QIDs found for this question.
    print('\n')  # Adds another blank line for readable console output.
    cluster_chain_of_entities = []  # Stores the selected entity chains across graph depths, showing the traversal path.
    search_entity_list = []  # Stores detailed relation/entity search results for saving and later analysis.
    Total_Related_Senteces = []  # Stores retrieved Wikipedia sentences used as evidence for LLM reasoning.

    # --- Step: Early Self-Consistency Check ---
    if args.self_consistency:  # Checks whether the run should trust an initial LLM self-consistency answer when confident enough.
        if data_point["cot_sc_score"] >= args.self_consistency_threshold:  # If the self-consistency score is high, graph traversal may be unnecessary.
            return data_point["cot_sc_response"], search_entity_list, [], [], 'gpt self-consistency', ''  # Returns the confident LLM answer early to save search cost.

    # --- Step: Fallback When No Topic Entity Exists ---
    if len(topic_entity) == 0 or args.gpt_only:  # If no starting QID exists, or graph search is disabled, ToG-2 cannot traverse the graph.
        answer = generate_only_with_gpt(question, args)  # Uses the LLM alone to answer without Wikidata/Wikipedia evidence.
        endmode = 'generate_without_explored_paths'  # Records that no graph paths were explored.
        remark = 'no_topic_entity'  # Records the reason for this fallback.
        print(remark)  # Logs the fallback reason.
        return answer, search_entity_list, [], [], endmode, remark  # Returns the LLM-only answer and empty search/evidence lists.

    # --- Step: Topic Entity Pruning ---
    if args.topic_prune and len(topic_entity) > 2:  # If many initial QIDs are present, prune them to reduce noisy graph traversal.

        print('--------------- topic entity prune ---------------')  # Logs the start of topic entity pruning.
        topic_entity = topic_e_prune(question, topic_entity, args)  # Uses the question/LLM/rules to keep only topic entities likely to matter.

        if len(topic_entity) == 0:  # If pruning removes every topic entity, graph traversal has no starting point.
            answer = generate_only_with_gpt(question, args)  # Falls back to answering only with the LLM.
            endmode = 'generate_without_explored_paths.'  # Records that no graph paths were used after pruning.
            remark = 'no_topic_entity_tp'  # Records that topic pruning caused the empty entity set.
            print(remark)  # Logs the reason for stopping graph search.
            return answer, search_entity_list, [], [], endmode, remark  # Returns early with empty graph/evidence outputs.
    else:  # Runs when pruning is disabled or there are only a few topic entities.
        print("No topic prune.")  # Logs that all initial topic entities are kept.

    # --- Step: Retrieval For Initial Topic Entities ---
    print('---------------collecting topic_entity docs---------------')  # Logs that Wikipedia evidence is being collected for starting entities.
    for entity_id in topic_entity:  # Iterates through each starting Wikidata QID in the topic entity dictionary.
        if entity_id != "[FINISH_ID]":  # Skips the special marker that means traversal should finish rather than expand an entity.
            entity_name = topic_entity[entity_id]  # Looks up the human-readable label for this QID.
            related_passage = get_wikipedia_page(wiki_client, {'name': entity_name, 'id': entity_id})  # Retrieves the Wikipedia page for the topic entity.
            paragraph, sorted_sentences = pages_embedding_search(question, related_passage, args,
                                                                 emb_model, top_k=3)  # Ranks sentences from the page by relevance to the question.
            Total_Related_Senteces.extend(sorted_sentences)  # Adds top evidence sentences to the global evidence pool.

    # --- Step: Retrieval-Only Reasoning When Depth Is Zero ---
    if args.depth == 0:  # If depth is zero, ToG-2 uses initial Wikipedia retrieval but does not traverse graph relations.
        references = ''  # Starts an empty reference block that will be inserted into the LLM prompt.
        if len(Total_Related_Senteces) > 0:  # Only creates references if retrieved sentences exist.
            references += "# References \n"  # Adds a heading so the LLM can distinguish evidence from the question.
            for idx, s in enumerate(Total_Related_Senteces[:args.num_sents_for_reasoning]):  # Keeps only the top evidence sentences for prompt length control.
                references += s["text"].strip() + '\n'  # Adds each retrieved sentence as textual evidence.
        if 'fever' in args.dataset or 'creak' in args.dataset:  # FEVER/CREAK are claim-verification tasks, not normal QA tasks.
            check_prompt = '### Claim:' + question  # Formats the input as a claim for verification prompting.
            if "fever" in args.dataset:  # Chooses the FEVER-specific reasoning prompt.
                system_prompt = prompt_reasoning_fever_3shot_2  # Uses few-shot FEVER examples to guide label-style reasoning.
            else:  # Handles CREAK-style claim verification.
                system_prompt = prompt_reasoning_creak_3shot  # Uses few-shot CREAK examples to guide true/false reasoning.
        else:  # Handles open-domain question answering datasets.
            check_prompt = '### Question:' + question  # Formats the input as a question for QA prompting.
            system_prompt = vanilla_prompt_reasoning_qa_2shot  # Uses few-shot QA examples to guide answer generation.
        final_prompt = system_prompt + '\n' + check_prompt + '\n' + references + '\n'  # Combines instructions, question/claim, and retrieved evidence into one LLM prompt.
        answer = run_llm(final_prompt, 0, 512, args.opeani_api_keys)  # Calls the LLM with deterministic decoding to generate the answer.
        return answer, [], [], [], '', ''  # Returns the retrieval-only answer with no graph traversal records.

    # --- Step: Initialize Graph Traversal Memory ---
    pre_relations = [''] * len(topic_entity)  # Tracks the previous relation used for each current entity to avoid poor repeated search.
    pre_heads = [-1] * len(topic_entity)  # Tracks relation direction from the previous hop; -1 means no previous direction yet.

    # --- Step: Graph Expansion Loop ---
    # Flow: at each depth, find useful relations from current QIDs, expand those relations to neighbor entities,
    # retrieve Wikipedia paragraphs for candidates, rank candidates, and ask the LLM whether enough evidence exists.
    for depth in range(1, args.depth + 1):  # Repeats graph traversal from hop 1 up to the maximum configured depth.
        print('\n-----------------------depth: ' + str(depth) + '-----------------------')  # Logs the current graph hop.
        current_entity_relations_list = []  # Stores candidate relations selected at this depth.
        all_entity_relations = {}  # Stores relations grouped by entity when joint relation pruning is enabled.

        # --- Step: Relation Search ---
        for index, entity_id in enumerate(topic_entity):  # Iterates over current frontier entities by index and QID.
            if entity_id != "[FINISH_ID]":  # Skips finish markers because they are not real Wikidata entities to expand.
                if args.relation_prune:  # If enabled, reduce the number of graph relations before entity expansion.
                    if args.relation_prune_combination:  # If enabled, collect relations first and prune them jointly across entities.
                        retrieve_relations = relation_search(entity_id, topic_entity[entity_id], pre_relations[index],
                                                             pre_heads[index], question, args, wiki_client)  # Retrieves possible outgoing/incoming relations for this QID.
                        all_entity_relations[topic_entity[entity_id]] = retrieve_relations  # Stores this entity's relations for later combined pruning.
                    else:  # Uses per-entity relation pruning rather than joint pruning.
                        retrieve_relations_with_scores = relation_search_prune(entity_id, topic_entity[entity_id],
                                                                               pre_relations[index], pre_heads[index],
                                                                               question, args,
                                                                               wiki_client)  # Searches and scores relations for this entity using the question context.
                        for relation in retrieve_relations_with_scores:  # Adds entity metadata to each relation record.
                            relation['entity_id'] = entity_id  # Records which QID this relation came from.
                            relation['entity_name'] = topic_entity[entity_id]  # Records the readable entity label for logs and prompts.
                        current_entity_relations_list.extend(retrieve_relations_with_scores)  # Adds pruned relations to this depth's relation list.
                else:  # If pruning is disabled, use all retrieved relations for expansion.
                    retrieve_relations = relation_search(entity_id, topic_entity[entity_id], pre_relations[index],
                                                         pre_heads[index], question, args, wiki_client)  # Retrieves relations connected to this QID from Wikidata.

                    print(len(retrieve_relations))  # Logs how many relations were found before pruning.
                    current_entity_relations_list.extend(retrieve_relations)  # Adds all retrieved relations to the expansion list.

        if args.relation_prune_combination and args.relation_prune:  # Runs joint relation pruning only when both pruning flags are enabled.
            current_entity_relations_list.extend(
                relation_prune_all(all_entity_relations, question, args))  # Selects the most relevant relations across all frontier entities.

        print(
            '\n---------------Find relation for: {}.---------------'.format(
                ','.join(topic_entity)))  # Logs which current QIDs were used for relation search.
        print('---------------total ' + str(len(current_entity_relations_list)) + ' rels')  # Logs the number of candidate relations kept.
        print(current_entity_relations_list)  # Prints relation records for debugging and experiment analysis.
        print('\n')  # Adds spacing after relation logs.

        # --- Step: Fallback If No First-Hop Relation Exists ---
        if depth == 1 and len(current_entity_relations_list) == 0:  # If the first hop has no relations, graph traversal cannot begin.
            answer = generate_only_with_gpt(question, args)  # Falls back to the LLM without graph evidence.
            remark = 'WiKi Error: cant find relation of first topic_entity. Depth 1 '  # Records the Wikidata/relation-search failure.
            print(remark, ": ", question)  # Logs the failure and the affected question.
            end_mode = 'generate_only_with_gpt'  # Records that the answer came from LLM-only generation.

            return answer, search_entity_list, Total_Related_Senteces, [], end_mode, remark  # Returns the fallback answer plus any initial evidence.

        # --- Step: Entity Expansion From Relations ---
        Indepth_total_candidates = []  # Stores all candidate neighbor entities found at this graph depth.
        each_relation_right_entityList = []  # Stores the neighbor entities found for each individual relation.
        for relation in current_entity_relations_list:  # Expands every selected relation into candidate neighbor entities.
            print('\n-------------------------------Searching ' + str(relation['entity_name']) + 'relation:  ' + str(
                relation['relation']))  # Logs which entity-relation pair is being expanded.
            if relation['head']:  # Checks whether the current entity is the head side of the relation.
                entity_candidates = entity_search(relation['entity_id'], relation['relation'], wiki_client, True)  # Finds tail entities connected by this relation.
            else:  # Handles the case where the current entity is the tail side of the relation.
                entity_candidates = entity_search(relation['entity_id'], relation['relation'], wiki_client, False)  # Finds head entities connected by this relation.
            if len(entity_candidates) == 0:  # If no neighbor entities were found for this relation, it cannot expand the path.
                continue  # Skips to the next relation.

            print('\n---------------Collected entity_candidates---------------')  # Logs that neighbor QIDs/entities were collected.
            print(entity_candidates)  # Prints the candidate entities for debugging.

            entity_candidates = [candidate for candidate in entity_candidates if len(candidate['name']) > 2]  # Removes very short labels because they are often noisy or uninformative.
            print('\n---------------Collecting entity_candidates docs---------------')  # Logs that Wikipedia retrieval will run for candidate entities.
            for candidate in entity_candidates:  # Retrieves evidence for each candidate neighbor entity.
                if candidate['id'] != '[FINISH_ID]':  # Real QIDs get Wikipedia retrieval; the finish marker does not.
                    related_passage = get_wikipedia_page(wiki_client, candidate)  # Fetches the candidate entity's Wikipedia page.
                    paragraphs = pages_embedding_search_only_para(related_passage)  # Extracts paragraph-level text for later question-aware ranking.
                    candidate['related_paragraphs'] = paragraphs  # Attaches retrieved paragraphs to the candidate entity record.
                else:  # Handles the special finish marker.
                    candidate['related_paragraphs'] = []  # Gives finish markers no paragraphs because they are not real entities.

            entity_candidates = [candidate for candidate in entity_candidates if
                                 bool(candidate.get('related_paragraphs'))]  # Keeps only candidates with retrievable Wikipedia paragraphs as useful evidence.
            Indepth_total_candidates = update_history_find_entity(entity_candidates, relation, Indepth_total_candidates)  # Adds candidates while preserving path/history information.
            each_relation_right_entityList.append({'current_relation': relation, 'right_entity': entity_candidates})  # Saves relation-to-candidates mapping for analysis.

        search_entity_list.append({'depth': depth, 'current_entity_relations_list': current_entity_relations_list,
                                   'each_relation_right_entityList': each_relation_right_entityList})  # Records everything searched at this depth for output JSONL.

        # --- Step: Fallback If No Entity Candidates Exist ---
        if len(Indepth_total_candidates) == 0:  # If relation expansion found no usable neighbor entities, traversal cannot continue.
            if depth:  # This is always true inside the depth loop, but keeps the original control flow unchanged.
                answer = generate_only_with_gpt(question, args)  # Uses the LLM alone because graph expansion failed at this depth.
                remark = 'no entity find in depth{}'.format(depth)  # Records which depth failed to produce entities.
                end_mode = 'generate_only_with_gpt'  # Records the fallback mode.
                print(remark)  # Logs the failure reason.
                return answer, search_entity_list, Total_Related_Senteces, [], end_mode, remark  # Returns fallback answer and saved search history.

        # --- Step: Ranking Candidate Entities ---
        flag, chain_of_entities, entities_id, pre_relations, pre_heads, sorted_entity_list, Indepth_total_candidates = para_rank_topk(
            question, Indepth_total_candidates, args, emb_model)  # Ranks candidate entities/paragraphs and keeps the best frontier for the next graph hop.

        cluster_chain_of_entities.append(chain_of_entities)  # Saves the selected entity chain for this depth as the current reasoning path.

        # --- Step: LLM Reasoning With Retrieved Graph Evidence ---
        if flag:  # If ranking produced a non-empty list, ToG-2 has evidence to reason over.
            for entity in sorted_entity_list:  # Iterates over ranked entities that survived pruning.
                s = entity['sentences']  # Gets the best evidence sentences attached to this entity.
                Total_Related_Senteces.extend(s)  # Adds those sentences to the global evidence pool.
            Total_Related_Senteces = list({sentence['text']: sentence for sentence in Total_Related_Senteces}.values())  # Deduplicates evidence by sentence text.
            sents = [s['text'] for s in Total_Related_Senteces]  # Extracts raw sentence strings for relevance scoring.
            scores = s2p_relevance_scores(sents, question, args, emb_model)  # Scores how relevant each sentence is to the question.
            Total_Related_Senteces = scores_rank(scores, sents)  # Sorts evidence sentences by relevance for the LLM prompt.
            stop, answer, kg_prompt = reasoning(original_question, Indepth_total_candidates, Total_Related_Senteces,
                                                cluster_chain_of_entities, args, clue)  # Asks the LLM to reason over graph paths and Wikipedia evidence.
            if stop:  # If the reasoning module believes the answer is found, stop graph traversal.
                print("\n-----------------------Find answer. ToG stoped at depth %d." % depth)  # Logs successful early stopping depth.
                end_mode = 'reasoning stop'  # Records that the LLM reasoner stopped the search.
                remark = "Find answer. ToG stoped at depth %d." % depth  # Saves a human-readable stop reason.

                return answer, search_entity_list, Total_Related_Senteces, cluster_chain_of_entities, end_mode, remark  # Returns final answer and all evidence/path records.
            else:  # If the LLM cannot answer yet, continue graph traversal if possible.
                print("\n-----------------------depth %d still not find the answer." % depth)  # Logs that more graph expansion is needed.
                flag_finish, entities_id = if_finish_list(entities_id)  # Checks whether every selected next entity is the finish marker.

                if flag_finish:  # If all next entities are finish markers, there is no real QID frontier left to expand.
                    answer = generate_only_with_gpt(question, args)  # Falls back to LLM-only generation because graph search cannot add new knowledge.
                    remark = "After entity_find_prune, all entities_id == [FINISH_ID]. No new knowledge added during search depth %d, stop searching." % depth  # Explains why traversal stops.

                    end_mode = 'generate_only_with_gpt'  # Records the fallback mode.
                    print(remark)  # Logs the stop reason.
                    return answer, search_entity_list, Total_Related_Senteces, [], end_mode, remark  # Returns answer with evidence but no final entity chain.
                else:  # There are still real QIDs to expand in the next hop.
                    topic_entity = {qid: topic for qid, topic in zip(entities_id,
                                                                     [wiki_client.query_all("qid2label", entity).pop()
                                                                      for entity in entities_id])}  # Converts selected next-hop QIDs into QID -> label dictionary for the next depth.
                    continue  # Moves to the next depth of graph traversal.
        else:  # Handles the case where candidate ranking returned no usable topic entities.
            remark = 'Last situation topic entity rank list in empty in depth {}, generate_only_with llm.'.format(depth)  # Records that ranking failed at this depth.
            end_mode = 'generate_only_with_gpt'  # Records LLM-only fallback.
            print(remark)  # Logs the failure reason.
            if 'fever' in args.dataset:  # FEVER expects label-style answers.
                answer = 'The answer is {NOT ENOUGH INFO}.'  # Uses a FEVER-compatible fallback when evidence is insufficient.
            else:  # Non-FEVER datasets use normal answer generation.
                answer = generate_only_with_gpt(question, args)  # Generates an answer without additional graph evidence.
            return answer, search_entity_list, Total_Related_Senteces, [], end_mode, remark  # Returns fallback answer and available search/evidence records.

    # --- Step: Final Fallback After Maximum Depth ---
    answer = generate_only_with_gpt(question, args)  # If all depths are exhausted without a confident answer, use the LLM alone.
    remark = 'Last situation.Not into depth. whether it trigger'  # Records that the loop ended without a reasoning stop.
    end_mode = 'generate_only_with_gpt'  # Records the final fallback mode.
    print(remark)  # Logs the final fallback reason.
    return answer, search_entity_list, Total_Related_Senteces, [], end_mode, remark  # Returns the fallback answer plus all collected search/evidence information.


# --- Step: Running Over Dataset Examples ---
length = min(samples_length, len(datas))  # Prevents the loop from requesting more examples than the dataset contains.


for i in range(start, length):  # Iterates through dataset examples from the chosen start index to the selected length.
    data = datas[i]  # Gets one dataset example, usually containing a question/claim, entities, and answer labels.
    query = data[question_string]  # Reads the question/claim text using the dataset-specific key returned by prepare_dataset.
    if args.self_consistency:  # If enabled, ask the LLM multiple/structured times before graph traversal to estimate confidence.
        data_point = self_consistency(query, data, i, args)  # Produces a self-consistency response and score for this example.
    else:  # If self-consistency is disabled, no early confidence result is available.
        data_point = []  # Uses an empty placeholder so the later function call still has the same argument shape.
    if 'qid_topic_entity' in data:  # Some datasets store initial entities as Wikidata QID -> label mappings.
        topic_entity = data['qid_topic_entity']  # Uses the QID topic entity dictionary for graph traversal.
    else:  # Other datasets store entities under a simpler key.
        topic_entity = data['entities']  # Uses the available entity dictionary/list from the dataset.
    if 'answer' in data:  # Many QA datasets store the gold answer under "answer".
        ground_truth = data["answer"]  # Reads the gold answer for saving/evaluation.
    elif 'answers' in data:  # Some datasets store multiple acceptable answers under "answers".
        ground_truth = data["answers"]  # Reads the list of gold answers.
    elif 'fever' in args.dataset:  # FEVER-style datasets store a claim verification label.
        ground_truth = data['label']  # Reads the FEVER label as the ground truth.
    else:  # Handles datasets without an available answer field.
        ground_truth = ''  # Uses an empty string so saving still works.

    answer, search_entity_list, Total_Related_Senteces, cluster_chain_of_entities, end_mode, remark = main_wiki_new(
        query, topic_entity, ground_truth, data_point)  # Runs the full ToG-2 graph retrieval and LLM reasoning pipeline for this example.

    save_2_jsonl_simplier(query, ground_truth, answer, search_entity_list, Total_Related_Senteces,
                          cluster_chain_of_entities, args.dataset, end_mode, remark, args)  # Saves the question, answer, evidence, graph paths, and run metadata to JSONL.
