import type { StageSpec } from "@/types";

type StageCardProps = {
  stage: StageSpec;
};

function TokenList({ items, tone }: { items: string[]; tone: "cyan" | "slate" }) {
  const className =
    tone === "cyan"
      ? "border-cyan-200 bg-cyan-50 text-cyan-900"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded border px-2.5 py-1 text-xs font-medium ${className}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function StageCard({ stage }: StageCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{stage.id}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{stage.name}</h2>
        </div>
        <span className="w-fit rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {stage.visualizationType}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{stage.purpose}</p>

      <section className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-base font-semibold text-slate-950">How This Stage Works</h3>
        <ol className="mt-3 space-y-3">
          {stage.howItWorks.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-base font-semibold text-slate-950">Related Visualization</h3>
        <dl className="mt-3 grid gap-1 rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm sm:grid-cols-[150px_1fr]">
          <dt className="font-medium text-cyan-800">Visualization Type</dt>
          <dd className="font-semibold text-cyan-950">{stage.visualizationLabel}</dd>
        </dl>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Inputs</h3>
          <TokenList items={stage.inputs} tone="slate" />
        </section>
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Outputs</h3>
          <TokenList items={stage.outputs} tone="cyan" />
        </section>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Functions Used</h3>
          <TokenList items={stage.functions} tone="slate" />
        </section>
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Files Used</h3>
          <TokenList items={stage.files} tone="cyan" />
        </section>
      </div>
    </article>
  );
}
