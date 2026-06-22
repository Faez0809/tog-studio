import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { routes } from "./routes";
const LandingPage=lazy(()=>import("@/pages/LandingPage").then(m=>({default:m.LandingPage})));
const JourneyPage=lazy(()=>import("@/pages/JourneyPage").then(m=>({default:m.JourneyPage})));
const ArchitectureExplorerPage=lazy(()=>import("@/pages/ArchitectureExplorerPage").then(m=>({default:m.ArchitectureExplorerPage})));
const ExecutionDebuggerPage=lazy(()=>import("@/pages/ExecutionDebuggerPage").then(m=>({default:m.ExecutionDebuggerPage})));
const GraphPlaygroundPage=lazy(()=>import("@/pages/GraphPlaygroundPage").then(m=>({default:m.GraphPlaygroundPage})));
const FunctionGalleryPage=lazy(()=>import("@/pages/FunctionGalleryPage").then(m=>({default:m.FunctionGalleryPage})));
const CaseStudiesPage=lazy(()=>import("@/pages/CaseStudiesPage").then(m=>({default:m.CaseStudiesPage})));
const NotFoundPage=lazy(()=>import("@/pages/NotFoundPage").then(m=>({default:m.NotFoundPage})));
function RouteSkeleton(){return <div className="route-skeleton space-y-5" role="status" aria-label="Loading page"><div className="h-6 w-40 rounded bg-slate-200"/><div className="h-10 max-w-xl rounded bg-slate-200"/><div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded-xl bg-slate-200"/><div className="h-28 rounded-xl bg-slate-200"/><div className="h-28 rounded-xl bg-slate-200"/></div><div className="h-72 rounded-xl bg-slate-200"/><span className="sr-only">Loading visualizer…</span></div>}
export function AppRoutes(){return <Suspense fallback={<RouteSkeleton/>}><Routes><Route path="/" element={<LandingPage/>}/><Route path="/home" element={<LandingPage/>}/><Route path={routes.journey.path} element={<JourneyPage/>}/><Route path={routes.architecture.path} element={<ArchitectureExplorerPage/>}/><Route path={routes.debugger.path} element={<ExecutionDebuggerPage/>}/><Route path={routes.playground.path} element={<GraphPlaygroundPage/>}/><Route path={routes.functions.path} element={<FunctionGalleryPage/>}/><Route path={routes.caseStudies.path} element={<CaseStudiesPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></Suspense>}
export {routes} from "./routes";
