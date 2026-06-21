import { motion } from "framer-motion";
import type { AnimationState } from "./VisualizationControls";
export function SelfConsistencyAnimation({ playing, speed, replayKey }: AnimationState) {
  const answers = ["Answer A","Answer A","Answer B","Answer A","Answer C","Answer A","Answer B","Answer A","Answer A","Answer A"];
  return <div key={replayKey} className="grid grid-cols-2 gap-2 sm:grid-cols-5">{answers.map((answer,i)=><motion.div key={i} initial={{opacity:.25,scale:.92}} animate={playing?{opacity:1,scale:1}:{}} transition={{delay:i*.14/speed}} className={`rounded-lg border p-3 text-center text-xs font-bold ${answer === "Answer A" ? "border-cyan-300 bg-cyan-50 text-cyan-900":"border-slate-200 bg-slate-50 text-slate-500"}`}>{answer}<motion.div initial={{width:0}} animate={playing?{width:answer === "Answer A"?"78%":"22%"}:{}} transition={{delay:(i*.14+.3)/speed,duration:.5/speed}} className="mx-auto mt-2 h-1 rounded bg-cyan-500" /></motion.div>)}</div>;
}
