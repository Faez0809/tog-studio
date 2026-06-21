import type { StageId } from "./stage";

export type TraceStatus = "pending" | "running" | "success" | "fallback" | "error";

export type TraceGraphNode = { id: string; label: string; kind: "topic" | "candidate" | "selected" };
export type TraceGraphEdge = { id: string; source: string; target: string; label: string };

export type TraceEvent = {
  id: string;
  stage: string;
  stageId: StageId;
  functionName: string;
  fileName: string;
  file: string;
  lineRange: [number, number];
  pseudoCode: string[];
  activeLine: number;
  input: unknown;
  output: unknown;
  variables: Record<string, unknown>;
  runtimeVariables: Record<string, unknown>;
  explanation: string;
  failureCases: string[];
  graphState: { nodes: TraceGraphNode[]; edges: TraceGraphEdge[] };
  timestamp: number;
  status: TraceStatus;
  logs: string[];
};
