import { ArrowRight, Check } from "lucide-react";
import type { StageId, StageSpec } from "@/types";

type PipelineFlowProps = {
  stages: StageSpec[];
  selectedStageId: StageId;
  onSelectStage: (stage: StageSpec) => void;
};

export function PipelineFlow({ stages, selectedStageId, onSelectStage }: PipelineFlowProps) {
  const selectedIndex = stages.findIndex((stage) => stage.id === selectedStageId);

  return (
    <nav aria-label="Pipeline stages" className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex min-w-max items-center">
        <div className="mr-4 border-r border-slate-200 pr-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pipeline Flow</p>
          <p className="mt-1 text-sm font-medium text-slate-900">Question</p>
        </div>

        {stages.map((stage, index) => {
          const isCurrent = index === selectedIndex;
          const isComplete = index < selectedIndex;
          const stateClasses = isCurrent
            ? "border-cyan-600 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-100"
            : isComplete
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800";

          return (
            <div key={stage.id} className="flex items-center">
              <ArrowRight
                aria-hidden="true"
                className={`mx-2 h-4 w-4 ${isComplete || isCurrent ? "text-emerald-500" : "text-slate-300"}`}
              />
              <button
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelectStage(stage)}
                className={`flex h-12 max-w-40 items-center gap-2 rounded-md border px-3 text-left text-xs font-semibold transition-colors ${stateClasses}`}
              >
                {isComplete ? <Check aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
                <span>{stage.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
