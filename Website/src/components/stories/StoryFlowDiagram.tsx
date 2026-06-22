import { ArrowRight, Code2 } from "lucide-react";
import type { RuntimeStory } from "@/data/runtimeStories";

export function StoryFlowDiagram({ story }: { story: RuntimeStory }) {
  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Code mapping</p>
          <h2 className="section-title mt-1">Runtime step to TOG function</h2>
        </div>
        <Code2 className="h-5 w-5 text-cyan-700" />
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {story.executionSteps.map((step, index) => (
          <div key={`${step.title}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-md bg-cyan-800 text-xs font-black text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{step.title}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  {step.phase} <ArrowRight className="h-3 w-3" /> <code>{step.code || "control flow"}</code>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
