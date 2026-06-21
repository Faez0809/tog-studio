import type { StageSpec } from "@/types";

type EvidencePreviewProps = {
  stage: StageSpec;
};

export function EvidencePreview({ stage }: EvidencePreviewProps) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Evidence Preview</h2>
        <span className="text-sm font-medium text-slate-600">{stage.name}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Evidence and path snippets will appear here when trace-backed retrieval data is added.
      </p>
    </section>
  );
}
