export const routes = {
  home: { path: "/", label: "Home" },
  journey: { path: "/journey", label: "Journey" },
  architecture: { path: "/architecture", label: "Architecture" },
  debugger: { path: "/debugger", label: "Execution Debugger" },
  playground: { path: "/graph-playground", label: "Graph Playground" },
  functions: { path: "/functions", label: "Function Gallery" },
  caseStudies: { path: "/case-studies", label: "Case Studies" },
} as const;

export type RouteKey = keyof typeof routes;
