import { useExport } from "../hooks/use-export";
import { MOCK_ARTIFACT_STATS } from "../mock/data";

import { ExportSummary } from "./export-summary";
import { ExportArtifacts } from "./export-artifacts";
import { ExportFormatSelector } from "./export-format-selector";
import { ExportOptionsPanel } from "./export-options-panel";
import { ExportPreview } from "./export-preview";
import { ExportStatusWidget } from "./export-status";
import { ExportQueue } from "./export-queue";
import { ExportHistory } from "./export-history";
import { ExportStatistics } from "./export-statistics";

export function ExportDashboard() {
  const {
    options,
    activeJobs,
    historyJobs,
    stats,
    startExport,
    cancelExport,
    updateOptions,
  } = useExport();

  // If there's an active job, show its status at the top of the queue section
  const currentActiveJob = activeJobs.length > 0 ? activeJobs[0] : undefined;
  const isExporting = activeJobs.length > 0;

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto w-full pb-12">
      <ExportSummary />
      
      <ExportArtifacts stats={MOCK_ARTIFACT_STATS} />
      
      <ExportFormatSelector 
        options={options} 
        onUpdateOptions={updateOptions} 
      />
      
      <ExportOptionsPanel 
        options={options} 
        onUpdateOptions={updateOptions} 
      />
      
      <ExportPreview 
        options={options} 
        onExport={startExport} 
        isExporting={isExporting} 
      />
      
      <ExportStatusWidget activeJob={currentActiveJob} />
      
      <ExportQueue 
        activeJobs={activeJobs} 
        onCancel={cancelExport} 
      />
      
      <ExportHistory historyJobs={historyJobs} />
      
      <ExportStatistics stats={stats} />
    </div>
  );
}
