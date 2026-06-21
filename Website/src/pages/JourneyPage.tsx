import { useMemo, useState } from "react";
import {
  EvidencePreview,
  JourneyTimeline,
  PipelineFlow,
  QuestionRunHeader,
  RuntimeInspector,
  StageCard,
} from "@/components/journey";
import { stages } from "@/data";
import type { StageId, StageSpec } from "@/types";

export function JourneyPage() {
  const [selectedStageId, setSelectedStageId] = useState<StageId>("self_consistency");

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.id === selectedStageId) ?? stages[0],
    [selectedStageId],
  );

  const handleSelectStage = (stage: StageSpec) => {
    setSelectedStageId(stage.id);
  };

  return (
    <section aria-labelledby="journey-page-title" className="space-y-6">
      <QuestionRunHeader />
      <PipelineFlow
        stages={stages}
        selectedStageId={selectedStage.id}
        onSelectStage={handleSelectStage}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(300px,380px)]">
        <div className="xl:sticky xl:top-8 xl:self-start">
          <JourneyTimeline stages={stages} selectedStageId={selectedStage.id} onSelectStage={handleSelectStage} />
        </div>
        <div className="min-w-0"><StageCard stage={selectedStage} /></div>
        <div className="min-w-0"><RuntimeInspector stage={selectedStage} /></div>
      </div>

      <EvidencePreview stage={selectedStage} />
    </section>
  );
}
