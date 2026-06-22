import { BookOpen, Lightbulb, Target } from "lucide-react";
import type { RuntimeStory } from "@/data/runtimeStories";

export function LessonPanel({ story }: { story: RuntimeStory }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="surface p-5">
        <BookOpen className="mb-4 h-5 w-5 text-cyan-700" />
        <p className="eyebrow">Why did TOG behave this way?</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{story.lessonLearned}</p>
      </article>
      <article className="surface p-5">
        <Lightbulb className="mb-4 h-5 w-5 text-amber-600" />
        <p className="eyebrow">Educational insight</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{story.educationalInsight}</p>
      </article>
      <article className="surface p-5">
        <Target className="mb-4 h-5 w-5 text-emerald-700" />
        <p className="eyebrow">Runtime outcome</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{story.runtimeRemark}</p>
      </article>
    </section>
  );
}
