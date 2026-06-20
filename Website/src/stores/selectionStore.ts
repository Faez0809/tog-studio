import { create } from "zustand";

type SelectionState = {
  selectedStageId: string | null;
  selectedFunctionName: string | null;
  selectedFilePath: string | null;
  selectedTraceEventId: string | null;
  selectedGraphNodeId: string | null;
  setSelectedStageId: (id: string | null) => void;
  setSelectedFunctionName: (name: string | null) => void;
  setSelectedFilePath: (path: string | null) => void;
  setSelectedTraceEventId: (id: string | null) => void;
  setSelectedGraphNodeId: (id: string | null) => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedStageId: null,
  selectedFunctionName: null,
  selectedFilePath: null,
  selectedTraceEventId: null,
  selectedGraphNodeId: null,
  setSelectedStageId: (selectedStageId) => set({ selectedStageId }),
  setSelectedFunctionName: (selectedFunctionName) => set({ selectedFunctionName }),
  setSelectedFilePath: (selectedFilePath) => set({ selectedFilePath }),
  setSelectedTraceEventId: (selectedTraceEventId) => set({ selectedTraceEventId }),
  setSelectedGraphNodeId: (selectedGraphNodeId) => set({ selectedGraphNodeId }),
}));
