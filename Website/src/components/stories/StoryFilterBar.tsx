import { SlidersHorizontal } from "lucide-react";
import type { StoryCategory } from "@/data/runtimeStories";

export function StoryFilterBar({
  categories,
  selected,
  onSelect,
}: {
  categories: StoryCategory[];
  selected: StoryCategory | "all";
  onSelect: (category: StoryCategory | "all") => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
      <span className="flex items-center gap-2 whitespace-nowrap text-xs font-bold text-slate-500">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </span>
      <FilterButton label="All" active={selected === "all"} onClick={() => onSelect("all")} />
      {categories.map((category) => (
        <FilterButton
          key={category}
          label={category.replace("-", " ")}
          active={selected === category}
          onClick={() => onSelect(category)}
        />
      ))}
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 whitespace-nowrap rounded-md border px-3 text-xs font-bold capitalize transition ${
        active
          ? "border-cyan-800 bg-cyan-800 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-cyan-400"
      }`}
    >
      {label}
    </button>
  );
}
