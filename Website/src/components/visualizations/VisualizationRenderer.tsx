import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { StageSpec } from "@/types";
import { AnimationLegend } from "./AnimationLegend";
import { AnswerGenerationAnimation } from "./AnswerGenerationAnimation";
import { EvidenceRankingAnimation } from "./EvidenceRankingAnimation";
import { GraphExpansionAnimation } from "./GraphExpansionAnimation";
import { ReasoningAnimation } from "./ReasoningAnimation";
import { RelationPruningAnimation } from "./RelationPruningAnimation";
import { SelfConsistencyAnimation } from "./SelfConsistencyAnimation";
import { TopicPruningAnimation } from "./TopicPruningAnimation";
import { VisualizationControls, type AnimationState } from "./VisualizationControls";

function RetrievalAnimation({ playing, speed, replayKey }: AnimationState) {
  const items = ["Question", "Wikipedia pages", "Retrieved evidence"];
  return <div key={replayKey} className="grid min-h-48 grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">{items.map((item,i)=><div key={item} className="contents"><motion.div initial={{opacity:0,scale:.9}} animate={playing?{opacity:1,scale:1}:{}} transition={{delay:i*.5/speed}} className={`rounded-xl border p-4 text-center text-xs font-bold ${i===2?"border-emerald-300 bg-emerald-50":"border-cyan-200 bg-cyan-50"}`}>{item}</motion.div>{i<2&&<motion.span initial={{opacity:0}} animate={playing?{opacity:1}:{}} transition={{delay:(i*.5+.3)/speed}} className="rotate-90 text-center text-cyan-600 sm:rotate-0">→</motion.span>}</div>)}</div>;
}

export function VisualizationRenderer({ stage }: { stage: StageSpec }) {
  const [playing,setPlaying]=useState(true); const [speed,setSpeed]=useState(1); const [replayKey,setReplayKey]=useState(0);
  useEffect(()=>{setReplayKey((k)=>k+1);setPlaying(true)},[stage.id]);
  const state={playing,speed,replayKey};
  const content = stage.id === "self_consistency" ? <SelfConsistencyAnimation {...state}/> : stage.id === "topic_pruning" ? <TopicPruningAnimation {...state}/> : stage.id === "wikipedia_retrieval" ? <RetrievalAnimation {...state}/> : stage.id === "relation_pruning" ? <RelationPruningAnimation {...state}/> : stage.id === "entity_expansion" ? <GraphExpansionAnimation {...state}/> : stage.id === "reasoning" ? <ReasoningAnimation {...state}/> : stage.id === "answer_generation" ? <AnswerGenerationAnimation {...state}/> : <EvidenceRankingAnimation {...state}/>;
  return <section className="mt-6 min-w-0 border-t border-slate-200 pt-5" aria-labelledby="visualization-title">
    <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 id="visualization-title" className="text-base font-semibold text-slate-950">Related Visualization</h3><p className="mt-1 break-words text-xs text-slate-500">{stage.visualizationLabel}</p></div><span className="badge max-w-full break-words">Live model</span></div>
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-5"><AnimationLegend items={[{label:"Active",color:"bg-cyan-500"},{label:"Selected",color:"bg-emerald-500"},{label:"Pruned / secondary",color:"bg-slate-300"}]}/><div className="my-5 min-w-0">{content}</div><VisualizationControls {...state} onPlayingChange={setPlaying} onSpeedChange={setSpeed} onReplay={()=>{setReplayKey(k=>k+1);setPlaying(true)}}/></div>
  </section>;
}
