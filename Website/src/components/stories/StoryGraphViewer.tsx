import ReactFlow, { Background, Controls, MarkerType, MiniMap, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import type { GraphState, RuntimeStory } from "@/data/runtimeStories";

const colors = {
  entity: "#0891b2",
  literal: "#d97706",
  process: "#64748b",
  answer: "#059669",
};

export function StoryGraphViewer({ story, current }: { story: RuntimeStory; current: number }) {
  const depth = story.executionSteps[current]?.depth ?? story.graphStates.at(-1)?.depth ?? 0;
  const state = story.graphStates.find((item) => item.depth >= depth) ?? story.graphStates.at(-1);

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
        <div>
          <p className="eyebrow">Graph visualization</p>
          <h2 className="section-title mt-1">Full {story.visualizationType} story</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            The main canvas tracks the current playback step. The progression below shows how the graph evolves across the whole execution.
          </p>
        </div>
        <span className="badge">Current depth {state?.depth ?? 0}</span>
      </div>

      <div className="h-[460px] bg-slate-50">
        {state && <GraphCanvas state={state} large />}
      </div>

      <div className="border-t border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Story progression</p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-950">Every graph state in this run</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">{story.graphStates.length} state{story.graphStates.length === 1 ? "" : "s"}</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {story.graphStates.map((graphState) => {
            const active = graphState.depth === state?.depth;
            return (
              <article
                key={`${story.id}-${graphState.depth}`}
                className={`overflow-hidden rounded-lg border ${
                  active ? "border-cyan-500 shadow-md shadow-cyan-900/10" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <strong className="text-sm text-slate-900">Depth {graphState.depth}</strong>
                  <span className="text-xs font-semibold text-slate-500">
                    {graphState.nodes.length} nodes / {graphState.edges.length} edges
                  </span>
                </div>
                <div className="h-[260px] bg-white">
                  <GraphCanvas state={graphState} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GraphCanvas({ state, large = false }: { state: GraphState; large?: boolean }) {
  const nodes: Node[] = state.nodes.map((node, index) => ({
    id: node.id,
    position: graphPosition(index, state.nodes.length, large),
    data: { label: node.label },
    style: {
      border: `2px solid ${colors[node.kind]}`,
      borderRadius: 8,
      color: "#0f172a",
      fontSize: large ? 13 : 11,
      fontWeight: 800,
      padding: large ? 12 : 8,
      width: large ? 170 : 135,
    },
  }));
  const edges: Edge[] = state.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#0891b2", strokeWidth: large ? 2 : 1.5 },
    labelStyle: { fontSize: large ? 12 : 10, fontWeight: 700 },
  }));

  return (
    <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} panOnScroll={large}>
      <Background />
      {large && <MiniMap pannable zoomable />}
      {large && <Controls />}
    </ReactFlow>
  );
}

function graphPosition(index: number, total: number, large: boolean) {
  const columns = total <= 3 ? total : large ? 4 : 3;
  const gapX = large ? 230 : 165;
  const gapY = large ? 130 : 105;
  return {
    x: (index % columns) * gapX,
    y: Math.floor(index / columns) * gapY,
  };
}
