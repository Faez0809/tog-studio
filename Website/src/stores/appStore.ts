import { create } from "zustand";
import type { RouteKey } from "@/app/routes/routes";

type AppState = {
  activeRoute: RouteKey | null;
  selectedDatasetId: string | null;
  selectedTraceId: string | null;
  setActiveRoute: (route: RouteKey) => void;
  setSelectedDatasetId: (datasetId: string | null) => void;
  setSelectedTraceId: (traceId: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeRoute: null,
  selectedDatasetId: null,
  selectedTraceId: null,
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setSelectedDatasetId: (selectedDatasetId) => set({ selectedDatasetId }),
  setSelectedTraceId: (selectedTraceId) => set({ selectedTraceId }),
}));
