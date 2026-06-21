export type StageId =
  | "self_consistency"
  | "topic_pruning"
  | "wikipedia_retrieval"
  | "embedding_search"
  | "relation_pruning"
  | "entity_expansion"
  | "candidate_ranking"
  | "reasoning"
  | "answer_generation";

export type StageSpec = {
  id: StageId;
  name: string;
  purpose: string;
  howItWorks: string[];
  inputs: string[];
  outputs: string[];
  functions: string[];
  files: string[];
  runtimeVariables: string[];
  failureCases: string[];
  visualizationType: string;
  visualizationLabel: string;
};
