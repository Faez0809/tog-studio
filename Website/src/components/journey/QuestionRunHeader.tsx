export function QuestionRunHeader() {
  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question Run</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">
            Which evidence and graph decisions lead ToG-2 from a question to an answer?
          </h1>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[520px]">
          {[
            ["Dataset", "Static docs"],
            ["Model", "LLM runtime"],
            ["Width", "args.width"],
            ["Depth", "graph loop"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs font-medium text-slate-500">{label}</dt>
              <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
