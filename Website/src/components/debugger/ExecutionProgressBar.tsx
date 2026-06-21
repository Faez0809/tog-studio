export function ExecutionProgressBar({ current, total }: { current: number; total: number }) {
  const percent = Math.round(((current + 1) / total) * 100);
  return <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"><div className="mb-2 flex justify-between text-xs font-semibold"><span className="text-slate-600">Pipeline progress</span><span className="text-blue-700">Step {current + 1} of {total} · {percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500" style={{width:`${percent}%`}}/></div></div>;
}
