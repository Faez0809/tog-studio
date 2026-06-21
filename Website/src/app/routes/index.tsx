import { Route, Routes } from "react-router-dom";
import {
  ArchitectureExplorerPage,
  ExecutionDebuggerPage,
  FunctionGalleryPage,
  GraphPlaygroundPage,
  JourneyPage,
  LandingPage,
  NotFoundPage,
} from "@/pages";
import { routes } from "./routes";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path={routes.journey.path} element={<JourneyPage />} />
      <Route path={routes.architecture.path} element={<ArchitectureExplorerPage />} />
      <Route path={routes.debugger.path} element={<ExecutionDebuggerPage />} />
      <Route path={routes.playground.path} element={<GraphPlaygroundPage />} />
      <Route path={routes.functions.path} element={<FunctionGalleryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export { routes } from "./routes";
