import type { ArchitecturePageData } from "@/types";
import { files } from "./files";

export const architecture: ArchitecturePageData = {
  files,
  moduleEdges: [
    {source:"main",target:"wiki",type:"runtime_call"},{source:"main",target:"search",type:"import"},{source:"main",target:"utils",type:"import"},{source:"main",target:"client",type:"import"},{source:"main",target:"prompts",type:"runtime_call"},
    {source:"wiki",target:"client",type:"runtime_call"},{source:"wiki",target:"search",type:"import"},{source:"wiki",target:"utils",type:"import"},{source:"search",target:"utils",type:"runtime_call"},{source:"utils",target:"prompts",type:"import"},{source:"datasets",target:"main",type:"data_read"},
    {source:"client",target:"wikidata",type:"external_call"},{source:"client",target:"wikipedia",type:"external_call"},{source:"utils",target:"llm",type:"external_call"},{source:"wiki",target:"llm",type:"external_call"},{source:"ner",target:"azure",type:"external_call"}
  ],
  externalServices: [
    {name:"Wikidata XML-RPC servers",purpose:"Serve relation, neighbor, label, and Wikipedia-title queries from local Wikidata shards.",usedBy:["client.py"],failureModes:["Server shard is offline","Timeout or malformed XML-RPC response","Entity or property is absent"]},
    {name:"Wikipedia",purpose:"Provides human-readable article text used as evidence for topic and candidate entities.",usedBy:["client.py","wiki_func.py"],failureModes:["Page is missing","HTTP timeout or error","Page text is empty or noisy"]},
    {name:"OpenAI-compatible LLM API",purpose:"Performs self-consistency, topic/relation pruning, reasoning, query reformulation, and fallback answers.",usedBy:["utils.py","wiki_func.py"],failureModes:["Credentials or endpoint are invalid","Rate limit or network failure","Response breaks the expected format"]},
    {name:"Azure NER",purpose:"Optionally identifies and links question entities to Wikidata IDs.",usedBy:["ner.py"],failureModes:["Azure credentials are missing","No linked entities are returned","Service request fails"]}
  ]
};

export const externalNodeIds = {"Wikidata XML-RPC servers":"wikidata",Wikipedia:"wikipedia","OpenAI-compatible LLM API":"llm","Azure NER":"azure"} as const;

export const dataFlowStages = [
  {id:"dataset",name:"Dataset",detail:"Read a question, ground truth, and linked topic entities.",modules:["utils.py","main_tog2.py"]},
  {id:"entities",name:"Entity Extraction",detail:"Use supplied or Azure-linked Wikidata entities as graph starting points.",modules:["ner.py","main_tog2.py"]},
  {id:"wikipedia",name:"Wikipedia Retrieval",detail:"Fetch article text for topic and expanded candidate entities.",modules:["client.py","wiki_func.py"]},
  {id:"expansion",name:"Graph Expansion",detail:"Prune relations and traverse Wikidata neighbors across bounded depths.",modules:["wiki_func.py","client.py"]},
  {id:"ranking",name:"Evidence Ranking",detail:"Score paragraphs, sentences, and candidate entities for relevance.",modules:["search.py","wiki_func.py"]},
  {id:"reasoning",name:"Reasoning",detail:"Combine graph paths and ranked references in an LLM prompt.",modules:["wiki_func.py","utils.py"]},
  {id:"answer",name:"Answer",detail:"Return the grounded or fallback answer and persist run metadata.",modules:["main_tog2.py","search.py"]},
];
