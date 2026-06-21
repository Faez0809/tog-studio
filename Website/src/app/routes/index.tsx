import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { routes } from "./routes";
const LandingPage=lazy(()=>import("@/pages/LandingPage").then(m=>({default:m.LandingPage})));
const JourneyPage=lazy(()=>import("@/pages/JourneyPage").then(m=>({default:m.JourneyPage})));
const ArchitectureExplorerPage=lazy(()=>import("@/pages/ArchitectureExplorerPage").then(m=>({default:m.ArchitectureExplorerPage})));
const ExecutionDebuggerPage=lazy(()=>import("@/pages/ExecutionDebuggerPage").then(m=>({default:m.ExecutionDebuggerPage})));
const GraphPlaygroundPage=lazy(()=>import("@/pages/GraphPlaygroundPage").then(m=>({default:m.GraphPlaygroundPage})));
const FunctionGalleryPage=lazy(()=>import("@/pages/FunctionGalleryPage").then(m=>({default:m.FunctionGalleryPage})));
const NotFoundPage=lazy(()=>import("@/pages/NotFoundPage").then(m=>({default:m.NotFoundPage})));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="grid min-h-[50vh] place-items-center" role="status">Loading visualizer…</div>}><Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path={routes.journey.path} element={<JourneyPage />} />
      <Route path={routes.architecture.path} element={<ArchitectureExplorerPage />} />
      <Route path={routes.debugger.path} element={<ExecutionDebuggerPage />} />
      <Route path={routes.playground.path} element={<GraphPlaygroundPage />} />
      <Route path={routes.functions.path} element={<FunctionGalleryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes></Suspense>
  );
}

export { routes } from "./routes";
