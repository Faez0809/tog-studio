import type { StageId } from "./stage";

export type TraceStatus = "pending" | "running" | "success" | "fallback" | "error";

export type TraceEvent = {
  id: string;
  stageId: StageId;
  functionName: string;
  file: string;
  timestamp?: number;
  status: TraceStatus;
  input: unknown;
  output: unknown;
  runtimeVariables: Record<string, unknown>;
  logs?: string[];
  error?: string;
};
