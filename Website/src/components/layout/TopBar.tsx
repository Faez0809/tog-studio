import { DatasetSelector } from "./DatasetSelector";
import { TraceSelector } from "./TraceSelector";

export function TopBar() {
  return (
    <header className="col-start-2 flex items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <p className="text-sm font-semibold text-slate-900">Educational Runtime Explorer</p>
        <p className="text-xs text-slate-500">Milestone 1 shell</p>
      </div>
      <div className="flex items-center gap-3">
        <DatasetSelector />
        <TraceSelector />
      </div>
    </header>
  );
}
