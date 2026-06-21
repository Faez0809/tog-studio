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

export type PlaygroundNodeType = "topic" | "entity" | "expanded" | "answer";

export type PlaygroundNode = {
  id: string;
  label: string;
  qid?: string;
  entityType: string;
  type: PlaygroundNodeType;
  depth: number;
  notes: string;
};

export type PlaygroundEdge = {
  id: string;
  source: string;
  target: string;
  relation: string;
  depth: number;
  inReasoningPath: boolean;
  whyItMatters: string;
};

export type GraphExample = {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  answer: string;
  maxDepth: number;
  nodes: PlaygroundNode[];
  edges: PlaygroundEdge[];
  reasoningPath: string[];
  educationalNotes: string;
  challenges: string[];
  pruningNote: string;
};
