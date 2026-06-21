import type { StageId, StageSpec } from "@/types";
import { StageTimelineItem } from "./StageTimelineItem";

type JourneyTimelineProps = {
  stages: StageSpec[];
  selectedStageId: StageId;
  onSelectStage: (stage: StageSpec) => void;
};

export function JourneyTimeline({ stages, selectedStageId, onSelectStage }: JourneyTimelineProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Timeline</h2>
      <ol className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {stages.map((stage, index) => (
          <StageTimelineItem
            key={stage.id}
            stage={stage}
            index={index}
            isSelected={stage.id === selectedStageId}
            onSelect={onSelectStage}
          />
        ))}
      </ol>
    </aside>
  );
}
