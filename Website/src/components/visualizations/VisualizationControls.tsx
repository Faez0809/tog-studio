import { Pause, Play, RotateCcw } from "lucide-react";

export type AnimationState = { playing: boolean; speed: number; replayKey: number };

type Props = AnimationState & {
  onPlayingChange: (playing: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onReplay: () => void;
};

export function VisualizationControls({ playing, speed, onPlayingChange, onSpeedChange, onReplay }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3" aria-label="Animation controls">
      <button type="button" className="btn-secondary gap-2" onClick={() => onPlayingChange(!playing)}>
        {playing ? <Pause size={15} /> : <Play size={15} />}{playing ? "Pause" : "Play"}
      </button>
      <button type="button" className="btn-secondary gap-2" onClick={onReplay}><RotateCcw size={15} /> Replay</button>
      <label className="ml-auto flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-600">
        Speed
        <select className="min-h-11 rounded-md border border-slate-300 bg-white px-2" value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}>
          <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option>
        </select>
      </label>
    </div>
  );
}
