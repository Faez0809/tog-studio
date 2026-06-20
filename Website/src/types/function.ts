import type { StageId } from "./stage";

export type FunctionSpec = {
  name: string;
  file: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  calledBy: string[];
  calls: string[];
  visualizationType: string;
  stageIds: StageId[];
};
