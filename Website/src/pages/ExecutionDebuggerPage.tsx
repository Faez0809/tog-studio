import { useEffect, useState } from "react";
import { CodeTracePanel, ExecutionProgressBar, ExecutionSummary, ExecutionTimeline, GraphStateViewer, QuestionExecutionHeader, RuntimeConsole, StepController, VariableInspector } from "@/components/debugger";
import { sampleTrace } from "@/data";

export function ExecutionDebuggerPage() {
  const [current,setCurrent]=useState(0); const [playing,setPlaying]=useState(false); const [speed,setSpeed]=useState(850); const last=sampleTrace.length-1;
  useEffect(()=>{if(!playing)return; if(current>=last){setPlaying(false);return} const timer=window.setTimeout(()=>setCurrent(x=>Math.min(x+1,last)),speed); return()=>window.clearTimeout(timer)},[playing,current,speed,last]);
  const select=(i:number)=>{setPlaying(false);setCurrent(i)}; const reset=()=>{setPlaying(false);setCurrent(0)}; const step=sampleTrace[current];
  return <section aria-label="TOG-2 execution debugger" className="space-y-4">
    <QuestionExecutionHeader completed={current===last}/>
    <ExecutionProgressBar current={current} total={sampleTrace.length}/>
    <StepController current={current} total={sampleTrace.length} playing={playing} speed={speed} onPrevious={()=>select(Math.max(0,current-1))} onNext={()=>select(Math.min(last,current+1))} onToggle={()=>{if(current===last)setCurrent(0);setPlaying(x=>!x)}} onReset={reset} onSpeed={setSpeed}/>
    <div className="grid items-start gap-4 xl:grid-cols-[245px_minmax(0,1fr)_350px]"><ExecutionTimeline trace={sampleTrace} current={current} onSelect={select}/><CodeTracePanel step={step}/><VariableInspector step={step}/></div>
    <GraphStateViewer step={step}/><RuntimeConsole trace={sampleTrace} current={current}/><ExecutionSummary trace={sampleTrace} complete={current===last}/>
  </section>;
}
