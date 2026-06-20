export type FileSpec = {
  path: string;
  role: string;
  imports: string[];
  usedBy: string[];
  majorFunctions: string[];
};
