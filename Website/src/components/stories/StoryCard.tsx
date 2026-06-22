import { ArrowUpRight, Network } from "lucide-react";
import type { RuntimeStory } from "@/data/runtimeStories";
import { RuntimeOutcomeBadge } from "./RuntimeOutcomeBadge";

export function StoryCard({
  story,
  selected,
  onSelect,
}: {
  story: RuntimeStory;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group min-w-[280px] snap-start rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg md:min-w-0 ${
        selected ? "border-cyan-500 bg-cyan-50 shadow-md" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="badge capitalize">{story.visualizationType.replace("-", " ")}</span>
        <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-600" />
      </div>
      <h3 className="mt-3 text-lg font-extrabold text-slate-950">{story.title}</h3>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{story.question}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {story.category.slice(0, 2).map((category) => (
          <span key={category} className="badge">
            {category}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Network className="h-4 w-4" />
          Depth {story.expectedDepth}
        </span>
        <RuntimeOutcomeBadge mode={/failure|fallback/.test(story.category.join()) ? "fallback" : "resolved"} />
      </div>
    </button>
  );
}
