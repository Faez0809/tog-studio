import { CheckCircle2, CircleDot, Database, Gauge } from "lucide-react";
import { sampleRun } from "@/data";

export function QuestionExecutionHeader({ completed }: { completed: boolean }) {
  return <header className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Execution debugger · static simulation</p><h1 className="mt-1 text-xl font-semibold">{sampleRun.question}</h1></div><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${completed ? "bg-emerald-400/15 text-emerald-300" : "bg-blue-400/15 text-blue-200"}`}>{completed ? <CheckCircle2 size={15}/> : <CircleDot size={15}/>} {completed ? "Execution complete" : "Inspecting execution"}</span></div>
    </div>
    <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
      {[{Icon:Database,label:"Dataset",value:sampleRun.dataset},{Icon:Gauge,label:"Model",value:sampleRun.model},{Icon:CircleDot,label:"Search width",value:sampleRun.width},{Icon:CircleDot,label:"Max depth",value:sampleRun.depth}].map(({Icon,label,value}) => <div className="flex items-center gap-3 px-4 py-3" key={label}><Icon className="text-slate-400" size={17}/><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="text-sm font-semibold text-slate-800">{value}</dd></div></div>)}
    </dl>
  </header>;
}
