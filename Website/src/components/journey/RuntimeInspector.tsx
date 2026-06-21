import type { StageSpec } from "@/types";
import { FailureCasePanel } from "./FailureCasePanel";
import { InputOutputTabs } from "./InputOutputTabs";
import { RuntimeVariableTable } from "./RuntimeVariableTable";

type RuntimeInspectorProps = {
  stage: StageSpec;
};

export function RuntimeInspector({ stage }: RuntimeInspectorProps) {
  return (
    <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Runtime Inspector</h2>
        <p className="mt-1 text-sm text-slate-600">Static runtime surface for the selected stage.</p>
      </div>
      <InputOutputTabs inputs={stage.inputs} outputs={stage.outputs} />
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Runtime Variables</h3>
        <RuntimeVariableTable variables={stage.runtimeVariables} />
      </section>
      <FailureCasePanel failureCases={stage.failureCases} />
    </aside>
  );
}
