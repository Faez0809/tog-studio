export type GraphNode = {
  id: string;
  label: string;
  qid?: string;
  type: "topic" | "candidate" | "selected" | "finish" | "discarded";
  score?: number;
  metadata?: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  relation: string;
  score?: number;
  direction: "head" | "tail";
};
