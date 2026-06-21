import type { StageSpec } from "@/types";

type StageTimelineItemProps = {
  stage: StageSpec;
  index: number;
  isSelected: boolean;
  onSelect: (stage: StageSpec) => void;
};

export function StageTimelineItem({ stage, index, isSelected, onSelect }: StageTimelineItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(stage)}
        className={`grid w-full grid-cols-[32px_1fr] gap-3 rounded-md border p-3 text-left transition-colors ${
          isSelected
            ? "border-cyan-500 bg-cyan-50 text-slate-950 shadow-sm"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
        aria-current={isSelected ? "step" : undefined}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            isSelected ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {index + 1}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{stage.name}</span>
          <span className="mt-1 block truncate text-xs text-slate-500">{stage.visualizationType}</span>
        </span>
      </button>
    </li>
  );
}
