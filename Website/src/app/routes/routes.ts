export const routes = {
  journey: { path: "/journey", label: "Journey" },
  architecture: { path: "/architecture", label: "Architecture" },
  debugger: { path: "/debugger", label: "Execution Debugger" },
  playground: { path: "/graph-playground", label: "Graph Playground" },
  functions: { path: "/functions", label: "Function Gallery" },
} as const;

export type RouteKey = keyof typeof routes;
