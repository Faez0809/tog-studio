import { useState } from "react";

type InputOutputTabsProps = {
  inputs: string[];
  outputs: string[];
};

type TabKey = "inputs" | "outputs";

export function InputOutputTabs({ inputs, outputs }: InputOutputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("inputs");
  const items = activeTab === "inputs" ? inputs : outputs;

  return (
    <section className="rounded-md border border-slate-200 bg-slate-50">
      <div className="grid grid-cols-2 border-b border-slate-200">
        {(["inputs", "outputs"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium capitalize ${
              activeTab === tab ? "bg-white text-cyan-700" : "text-slate-500 hover:bg-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <ul className="space-y-2 p-3">
        {items.map((item) => (
          <li key={item} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
