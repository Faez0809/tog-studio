import type { StageId } from "./stage";

export type FunctionCategory = "Retrieval" | "Graph" | "Ranking" | "Reasoning" | "Utilities";
export type FunctionComplexity = "Low" | "Medium" | "High";

export type FunctionSpec = {
  id: string;
  name: string;
  file: string;
  stage: StageId;
  category: FunctionCategory;
  purpose: string;
  description: string;
  inputs: string[];
  outputs: string[];
  calledBy: string[];
  calls: string[];
  visualizationType: string;
  runtimeVariables: string[];
  failureCases: string[];
  complexity: FunctionComplexity;
  educationalNotes: string;
};
