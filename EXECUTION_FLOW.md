# Execution Flow

The main execution flow starts in `TOG_Original/ToG-2/main_tog2.py`. It is a script-style entry point: argument parsing, dataset/model/client setup, and the per-sample loop execute at module top level.

## Main CLI Flow

```mermaid
flowchart TD
    A["Start: python main_tog2.py"] --> B["Parse CLI args"]
    B --> C["prepare_dataset(args.dataset)"]
    C --> D["Set CUDA_VISIBLE_DEVICES"]
    D --> E{"args.embedding_model_name"}
    E --> E1["Load BGE bi-encoder"]
    E --> E2["Load MiniLM / BGE cross-encoder"]
    E --> E3["Use BM25 function"]
    E --> E4["Load ColBERT-style BGE-M3"]
    E1 --> F["Read server_urls.txt"]
    E2 --> F
    E3 --> F
    E4 --> F
    F --> G["MultiServerWikidataQueryClient"]
    G --> H["test_connections()"]
    H --> I["For each dataset sample"]
    I --> J{"self_consistency?"}
    J -->|yes| K["utils.self_consistency()"]
    J -->|no| L["Use empty data_point"]
    K --> M["Extract topic_entity and ground_truth"]
    L --> M
    M --> N["main_wiki_new(query, topic_entity, ground_truth, data_point)"]
    N --> O["save_2_jsonl_simplier(...)"]
    O --> P{"More samples?"}
    P -->|yes| I
    P -->|no| Q["End"]
```

## Per-Question ToG-2 Flow

`main_wiki_new` is the core pipeline function.

```mermaid
flowchart TD
    A["main_wiki_new(question, topic_entity, ground_truth, data_point)"] --> B{"High self-consistency score?"}
    B -->|yes| B1["Return cached confident LLM response"]
    B -->|no| C{"No topic entity or gpt_only?"}
    C -->|yes| C1["generate_only_with_gpt()"]
    C -->|no| D{"topic_prune and >2 entities?"}
    D -->|yes| E["topic_e_prune()"]
    D -->|no| F["Keep topic entities"]
    E --> G{"Entities remain?"}
    G -->|no| G1["generate_only_with_gpt()"]
    G -->|yes| H["Retrieve Wikipedia pages for topic entities"]
    F --> H
    H --> I["pages_embedding_search()"]
    I --> J{"depth == 0?"}
    J -->|yes| J1["Reason over retrieved sentences only"]
    J -->|no| K["Initialize previous relations/heads"]
    K --> L["For depth = 1..args.depth"]
    L --> M["Search/prune relations"]
    M --> N{"No first-hop relations?"}
    N -->|yes| N1["generate_only_with_gpt()"]
    N -->|no| O["entity_search() for each relation"]
    O --> P["get_wikipedia_page() for candidates"]
    P --> Q["pages_embedding_search_only_para()"]
    Q --> R["update_history_find_entity()"]
    R --> S{"Any candidates?"}
    S -->|no| S1["generate_only_with_gpt()"]
    S -->|yes| T["para_rank_topk()"]
    T --> U{"Ranked candidates exist?"}
    U -->|no| U1["Fallback answer"]
    U -->|yes| V["Rank evidence sentences"]
    V --> W["reasoning()"]
    W --> X{"LLM says answer found?"}
    X -->|yes| X1["Return answer, paths, evidence"]
    X -->|no| Y{"Frontier only [FINISH_ID]?"}
    Y -->|yes| Y1["generate_only_with_gpt()"]
    Y -->|no| Z["Convert next QIDs to labels and continue depth loop"]
    Z --> L
    L --> AA["Max depth exhausted"]
    AA --> AB["generate_only_with_gpt()"]
```

## Data Flow

```mermaid
flowchart LR
    Datasets["data/*.json"] --> Prep["utils.prepare_dataset"]
    Prep --> Records["Dataset records"]
    Records --> Question["question / claim / input text"]
    Records --> Topics["qid_topic_entity or entities"]
    Records --> Gold["answer / answers / label"]

    Topics --> Graph["Wikidata graph expansion"]
    Graph --> Relations["Relations"]
    Relations --> Candidates["Neighbor entity candidates"]
    Candidates --> Wiki["Wikipedia page text"]
    Wiki --> Paragraphs["Paragraphs"]
    Paragraphs --> Ranker["Embedding/BM25 ranking"]
    Ranker --> Sentences["Top evidence sentences"]

    Question --> LLMReason["LLM reasoning prompts"]
    Sentences --> LLMReason
    Graph --> Paths["Knowledge triplets"]
    Paths --> LLMReason
    LLMReason --> Answer["Generated answer"]

    Answer --> Output["Output JSON"]
    Gold --> Output
    Sentences --> Output
    Paths --> Output
```

## Wikidata Service Flow

The runtime client expects XML-RPC servers created from preprocessed Wikidata data.

```mermaid
flowchart TD
    Dump["Wikidata dump .gz"] --> Reader["reader_process.read_data"]
    Reader --> Queue["Multiprocessing queues"]
    Queue --> Worker["worker_process.process_data"]
    Worker --> Tables["JSONL shards: labels, plabels, entity_rels, values, ids"]
    Tables --> Indexer["db_deploy/build_index.py"]
    Indexer --> Pickles["relation_entities, tail_entities, tail_values, external_ids, mid_to_qid"]
    Pickles --> Server["db_deploy/server.py"]
    Server --> XMLRPC["XML-RPC methods"]
    XMLRPC --> Runtime["ToG-2/client.py query_all()"]
    Runtime --> Main["main_tog2.py graph traversal"]
```

## Evaluation Flow

```mermaid
flowchart TD
    A["python eval.py --dataset ... --output_file ..."] --> B["prepare_dataset_for_eval()"]
    B --> C["Load ground-truth dataset"]
    B --> D["Load generated output JSON"]
    C --> E["Map question text to original record"]
    D --> F["For each output record"]
    F --> G["align() expected answers"]
    G --> H["exact_match(generated, answers)"]
    H --> I["Count right/error"]
    I --> J["Print Exact Match"]
```

## Important Runtime Branches

- `--self_consistency True`: runs 10 sampled LLM completions before graph search and may skip ToG traversal when agreement is at or above `--self_consistency_threshold`.
- `--gpt_only True`: bypasses graph traversal and calls `generate_only_with_gpt`.
- `--depth 0`: retrieves topic-entity Wikipedia evidence but does not expand graph relations.
- `--relation_prune True`: asks the LLM to select promising relations before expanding entities.
- `--relation_prune_combination True`: prunes relations jointly across current frontier entities.
- `--topic_prune True`: prunes initial topic entities when more than two are available.
- `--embedding_model_name`: controls whether evidence ranking uses BGE, MiniLM, BM25, BGE reranker, or ColBERT-style scoring.

