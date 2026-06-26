import { useValidationStore } from '@/store/validation-store';
import { validationClient } from '@/lib/api/validation-client';

export function useValidation() {
  const store = useValidationStore();

  const alignFrames = async () => {
    if (!store.artifactId || !store.groundTruthFileId) return;

    store.setValidationState({ validationLoading: true, validationError: null });

    try {
      // Mocking alignment delay since backend doesn't have the /validation/align route yet
      // The Leaflet images handle visual stacking using precise map bounds directly.
      await new Promise(resolve => setTimeout(resolve, 800));

      store.setValidationState({
        validationLoading: false,
        validationPair: {
          generatedId: store.artifactId,
          groundTruthId: store.groundTruthFileId,
        },
        alignedGenerated: null,   // We don't need pure JSON data; we use layerUrl now
        alignedGroundTruth: null, // We don't need pure JSON data; we use layerUrl now
        differenceMap: null,      // We use getErrorMapLayerUrl now instead of JSON
      });

      // Trigger metrics computation immediately after alignment
      computeMetrics();
      
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during alignment';
      store.setValidationState({
        validationLoading: false,
        validationError: errorMsg,
      });
    }
  };

  const computeMetrics = async () => {
    if (!store.artifactId || !store.groundTruthFileId) return;

    store.setMetricsState({ metricsLoading: true, metricsError: null });

    try {
      const metricsData = await validationClient.compareMetrics({
        generated_file_id: store.artifactId,
        ground_truth_file_id: store.groundTruthFileId,
        variable: store.selectedVariable || "C13",
      });

      store.setMetricsState({
        metricsLoading: false,
        metrics: metricsData,
      });
      store.setMetricsComputed(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred calculating metrics';
      store.setMetricsState({
        metricsLoading: false,
        metricsError: errorMsg,
      });
    }
  };

  return {
    alignFrames,
  };
}
