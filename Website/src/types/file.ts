export type ModuleCategory = "runtime" | "retrieval" | "graph" | "utilities" | "external" | "data";

export type FileSpec = {
  id: string;
  name: string;
  path: string;
  purpose: string;
  role: string;
  category: ModuleCategory;
  imports: string[];
  majorFunctions: string[];
  usedBy: string[];
  externalCalls: string[];
  description: string;
  responsibilities: string[];
  educationalNote: string;
};
