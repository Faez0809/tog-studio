import { DatasetSelector } from "./DatasetSelector";
import { TraceSelector } from "./TraceSelector";

export function TopBar() {
  return (
    <header>
      <DatasetSelector />
      <TraceSelector />
    </header>
  );
}
