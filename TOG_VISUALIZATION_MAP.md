# ToG Visualization Map

This table maps important ToG-2 functions to visualization types that would make their runtime behavior understandable in an interactive visualizer.

| Function Name | What It Does | Best Visualization Type |
|---|---|---|
| `main_wiki_new()` | Runs one full question through self-consistency, pruning, retrieval, graph expansion, ranking, reasoning, and fallback logic. | End-to-end pipeline timeline with expandable stage cards |
| `prepare_dataset()` | Loads the selected dataset and returns the field name containing the question or claim. | Dataset selector + record preview table |
| `self_consistency()` | Samples multiple LLM answers and computes agreement before graph search. | Vote distribution chart with confidence threshold line |
| `get_s1_prompt()` | Builds the dataset-specific prompt used for self-consistency sampling. | Prompt template preview |
| `get_cot_sc_results()` | Runs multiple chain-of-thought completions and extracts majority answer agreement. | Multi-response comparison grid + majority highlight |
| `run_llm()` | Sends prompts to an OpenAI-compatible model or local LLaMA server. | Request/response panel with retry timeline |
| `run_llm_json()` | Calls the LLM in JSON-output mode for structured pruning decisions. | JSON prompt + parsed response inspector |
| `topic_e_prune()` | Selects useful initial topic entities and removes noisy starting nodes. | Node elimination animation |
| `construct_topic_prune_prompt()` | Formats question and topic entities into the topic-pruning prompt. | Prompt builder view |
| `get_wikipedia_page()` | Retrieves Wikipedia text for a topic or candidate entity. | Entity-to-document fetch animation |
| `WikidataQueryClient.get_wikipedia_page()` | Downloads and cleans a Wikipedia page from an entity name or QID. | Web page extraction view with cleaned text highlight |
| `MultiServerWikidataQueryClient.query_all()` | Sends the same query to all configured Wikidata servers and merges results. | Parallel server fan-out/fan-in diagram |
| `MultiServerWikidataQueryClient.test_connections()` | Tests configured Wikidata XML-RPC servers and removes unreachable ones. | Server health checklist |
| `pages_embedding_search()` | Splits Wikipedia text, ranks paragraphs, then ranks sentences for evidence. | Ranking visualization with paragraph-to-sentence drilldown |
| `pages_embedding_search_only_para()` | Extracts cleaned paragraphs from a Wikipedia page without scoring them. | Document chunking visualization |
| `split_paragraphs()` | Cleans and filters Wikipedia text into usable paragraphs. | Text segmentation view |
| `split_sentences_windows()` | Converts paragraph text into sentences or sliding sentence windows. | Sliding-window sentence animation |
| `s2p_relevance_scores()` | Dispatches relevance scoring to BGE, MiniLM, BM25, BGE reranker, or ColBERT. | Model scoring switchboard |
| `biencoder_similarity()` | Scores passages using bi-encoder embeddings and dot product. | Vector similarity heatmap |
| `crossencoder_similarity()` | Scores question-text pairs with a cross-encoder or reranker. | Pairwise scoring list |
| `compute_bm25_similarity()` | Scores text using keyword-based BM25 relevance. | Keyword overlap bar chart |
| `scores_rank()` | Sorts text evidence by relevance score. | Ranked list with animated reorder |
| `relation_search()` | Retrieves available incoming/outgoing relations for a Wikidata entity without LLM pruning. | Radial relation graph |
| `relation_search_prune()` | Retrieves relations and asks the LLM to keep the most relevant ones. | Relation pruning animation with score badges |
| `relation_prune_all()` | Prunes relations jointly across all current frontier entities. | Multi-entity relation matrix |
| `construct_relation_prune_prompt()` | Builds the per-entity relation-pruning prompt. | Prompt + relation list preview |
| `construct_all_relation_prune_prompt()` | Builds the joint relation-pruning prompt for multiple entities. | Grouped prompt builder view |
| `clean_relations()` | Parses scored relation records from LLM output. | Raw-to-structured parse visualization |
| `clean_relation_all_e()` | Parses joint relation-pruning output and maps relation names back to entities. | Entity-relation matching table |
| `abandon_rels()` | Filters unhelpful Wikidata relations such as IDs, URLs, categories, and generic metadata. | Rule-based filter chips |
| `check_end_word()` | Detects relation labels ending with low-value words such as `ID`, `code`, or `URL`. | Rule match highlighter |
| `entity_search()` | Expands a selected relation into neighboring Wikidata entities or literal finish values. | Graph expansion animation |
| `entity_search_fin()` | Expands finance-domain graph relations using a finance DB client. | Domain-specific graph expansion view |
| `entity_find()` | Uses the LLM to select top candidate entities from a candidate list. | Candidate selection board |
| `match_top2_entities()` | Maps LLM-selected entity names back to candidate entity records. | Name matching table |
| `update_history_find_entity()` | Adds relation, topic entity, direction, and paragraph metadata to candidates. | Path-history trace view |
| `para_rank_topk()` | Scores candidate paragraphs, aggregates scores by entity, and selects the next frontier. | Candidate ranking dashboard |
| `para_rank_topk_fin()` | Finance-specific candidate paragraph ranking and next-frontier selection. | Finance path ranking dashboard |
| `reasoning()` | Builds final prompt from knowledge triplets and evidence, calls the LLM, and decides whether to stop. | Prompt + answer visualization |
| `reasoning_fin()` | Finance-specific reasoning over path text and retrieved evidence. | Finance prompt + answer visualization |
| `contains_yes_regex()` | Detects whether the LLM response indicates that the answer was found. | Stop-signal detector |
| `extract_answer()` | Extracts text inside braces from LLM output. | Answer extraction highlighter |
| `if_true()` | Converts a normalized `yes` marker into a Boolean stop decision. | Boolean decision badge |
| `if_finish_list()` | Checks whether all next entities are `[FINISH_ID]` and removes finish markers otherwise. | Frontier termination indicator |
| `generate_only_with_gpt()` | Generates an answer without graph traversal using a dataset-aware fallback prompt. | Fallback prompt + answer panel |
| `generate_without_explored_paths()` | Generates a CoT answer without explored paths. | LLM-only generation panel |
| `generate_only_with_sentences()` | Generates an answer from retrieved evidence sentences without graph paths. | Evidence-only answer panel |
| `query_reformulate_clue()` | Uses clue-marked LLM output to rewrite the search query. | Query rewrite diff view |
| `query_reformulate_add()` | Appends clue text to the original question for later retrieval. | Query augmentation view |
| `question_clearify()` | Rewrites or clarifies a question using clue context. | Before/after question transformation |
| `save_2_jsonl_simplier()` | Saves compact result records to the run output JSON file. | Output record preview |
| `save_2_jsonl()` | Saves richer result records including evidence and path details. | Full result JSON inspector |
| `retrieve_top_docs()` | Ranks generic documents by embedding similarity. | Top-k document ranking view |
| `clean_scores()` | Parses numeric scores from LLM output. | Score extraction highlighter |
| `clean_relations_bm25_sent()` | Converts BM25-ranked relations into structured relation records. | Relation score table |
| `all_unknown_entity()` | Checks whether every candidate is an unknown placeholder. | Candidate quality indicator |
| `del_unknown_entity()` | Removes unknown placeholder entities when real candidates exist. | Candidate cleanup animation |
| `dynamic_requery_fin()` | Chooses finance search mode from LLM answer text. | Search mode toggle visualization |
| `format_entity_name_for_wikipedia()` | Converts entity names into Wikipedia URL-safe titles. | URL transformation chip |
| `WikidataQueryClient.label2qid()` | Converts entity labels into Wikidata QIDs. | Label-to-QID lookup card |
| `WikidataQueryClient.label2pid()` | Converts relation labels into Wikidata PIDs. | Relation-to-PID lookup card |
| `WikidataQueryClient.qid2label()` | Converts QIDs into human-readable labels. | QID-to-label lookup card |
| `WikidataQueryClient.pid2label()` | Converts PIDs into human-readable relation labels. | PID-to-label lookup card |
| `WikidataQueryClient.get_all_relations_of_an_entity()` | Retrieves all incoming and outgoing relations for one QID. | Head/tail relation split graph |
| `WikidataQueryClient.get_tail_entities_given_head_and_relation()` | Retrieves entities connected by a relation. | Edge traversal graph |
| `WikidataQueryClient.get_tail_values_given_head_and_relation()` | Retrieves literal values for an entity-relation pair. | Literal-value endpoint view |
| `entity_linking_azure_search()` | Uses Azure linked-entity recognition and Wikipedia info pages to map question mentions to QIDs. | Mention-to-entity linking overlay |
| `entity_linking_azure_cache()` | Loads cached entity links for a question. | Cache lookup table |
| `eval.prepare_dataset_for_eval()` | Loads ground-truth and generated output files for evaluation. | Evaluation input summary |
| `eval.align()` | Builds acceptable answer lists for a generated output record. | Answer normalization table |
| `eval.exact_match()` | Checks whether generated answer matches any acceptable answer. | Match/mismatch badge |

