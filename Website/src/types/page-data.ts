import type { FileSpec } from "./file";
import type { FunctionSpec } from "./function";
import type { GraphEdge, GraphNode } from "./graph";
import type { StageSpec } from "./stage";
import type { TraceEvent } from "./trace";

export type JourneyPageData = {
  runSummary: {
    question: string;
    dataset: string;
    topicEntities: Array<{ qid: string; label: string }>;
    finalAnswer: string;
    endMode: string;
    remark: string;
  };
  stages: StageSpec[];
  traceEvents: TraceEvent[];
  evidence: Array<{ text: string; score: number; entity?: string }>;
};

export type ArchitecturePageData = {
  files: FileSpec[];
  moduleEdges: Array<{
    source: string;
    target: string;
    type: "import" | "runtime_call" | "data_read" | "external_call";
  }>;
  externalServices: Array<{
    name: string;
    purpose: string;
    usedBy: string[];
    failureModes: string[];
  }>;
};

export type ExecutionDebuggerData = {
  trace: TraceEvent[];
  callChain: Array<{
    functionName: string;
    file: string;
    depth: number;
    eventId: string;
  }>;
  prompts: Array<{
    eventId: string;
    promptType: "self_consistency" | "topic_prune" | "relation_prune" | "reasoning" | "fallback";
    prompt: string;
    response: string;
    parsedOutput?: unknown;
  }>;
};

export type GraphPlaygroundData = {
  question: string;
  depthFrames: Array<{
    depth: number;
    frontier: string[];
    nodes: GraphNode[];
    edges: GraphEdge[];
    relationCandidates: Array<{
      entityId: string;
      entityName: string;
      relation: string;
      score?: number;
      selected: boolean;
      head: boolean;
    }>;
    candidateRankings: Array<{
      entityId: string;
      entityName: string;
      score: number;
      relation: string;
      evidence: Array<{ text: string; score: number }>;
    }>;
  }>;
};

export type FunctionGalleryData = {
  functions: FunctionSpec[];
  stages: StageSpec[];
  visualizationTypes: Array<{
    id: string;
    label: string;
    description: string;
    exampleFunctions: string[];
  }>;
};
