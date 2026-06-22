import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Network, Search } from "lucide-react";
import { runtimeStories, storyCategories, type StoryCategory } from "@/data/runtimeStories";
import {
  LessonPanel,
  StoryFilterBar,
  StoryFlowDiagram,
  StoryGallery,
  StoryGraphViewer,
  StoryInspector,
  StoryPlayer,
  StoryTimeline,
} from "@/components/stories";

export function CaseStudiesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StoryCategory | "all">("all");
  const [selectedId, setSelectedId] = useState(runtimeStories[0]?.id ?? "");
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const stories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return runtimeStories.filter((story) => {
      const matchesCategory = category === "all" || story.category.includes(category);
      const haystack = [story.title, story.question, story.finalAnswer, story.category.join(" ")].join(" ").toLowerCase();
      return matchesCategory && (!needle || haystack.includes(needle));
    });
  }, [category, query]);

  const selected = stories.find((story) => story.id === selectedId) ?? stories[0] ?? runtimeStories[0];

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
    setCurrent(0);
    setPlaying(false);
  }, [selected?.id]);

  useEffect(() => {
    if (!playing || !selected) return;
    const handle = window.setInterval(() => {
      setCurrent((value) => {
        if (value >= selected.executionSteps.length - 1) {
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, speed * 1000);
    return () => window.clearInterval(handle);
  }, [playing, selected, speed]);

  if (!selected) return null;

  const succeeded = selected.category.includes("success");
  const failed = selected.category.includes("failure") || selected.category.includes("fallback");

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,#0891b2,transparent_35%),radial-gradient(circle_at_80%_20%,#f59e0b,transparent_24%)]" />
        <div className="relative max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">Interactive Runtime Stories</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">TOG-2 executions you can step through.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Successful paths, fallbacks, literal values, FEVER verdicts, ablations, and graph failures rendered as an interactive debugger.
          </p>
        </div>
      </section>

      <section className="surface p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories, outcomes, or questions"
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm"
            />
          </label>
          <StoryFilterBar categories={storyCategories} selected={category} onSelect={setCategory} />
        </div>
      </section>

      <StoryGallery stories={stories} selected={selected.id} onSelect={setSelectedId} />

      <section className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Selected story</p>
            <h2 className="section-title mt-1">{selected.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{selected.question}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {succeeded && <span className="badge"><CheckCircle2 className="mr-1 h-3 w-3" />Resolved</span>}
            {failed && <span className="badge bg-amber-100 text-amber-800"><AlertTriangle className="mr-1 h-3 w-3" />Fallback-aware</span>}
            <span className="badge"><Network className="mr-1 h-3 w-3" />Depth {selected.expectedDepth}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <StoryTimeline story={selected} current={current} onChange={setCurrent} />
        <StoryPlayer story={selected} current={current} playing={playing} speed={speed} onPlaying={setPlaying} onCurrent={setCurrent} onSpeed={setSpeed} />
        <StoryInspector story={selected} current={current} />
      </section>

      <StoryGraphViewer story={selected} current={current} />
      <LessonPanel story={selected} />
      <StoryFlowDiagram story={selected} />

      <section className="surface p-5">
        <p className="eyebrow">Important insights</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Insight label="Why it succeeded or failed" value={selected.educationalInsight} />
          <Insight label="Responsible component" value={selected.executionSteps[current]?.phase ?? "Pipeline"} />
          <Insight label="Fallback activated" value={failed ? selected.endMode : "No fallback required"} />
          <Insight label="Code modules" value="main_tog2.py, wiki_func.py, search.py, utils.py" />
        </div>
      </section>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-700">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </article>
  );
}
