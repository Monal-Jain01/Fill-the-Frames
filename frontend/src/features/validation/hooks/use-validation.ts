import { useValidationStore } from '@/store/validation-store';
import { validationClient } from '@/lib/api/validation-client';
import { visualizationClient } from '@/lib/api/visualization-client';

export function useValidation() {
  const store = useValidationStore();

  const fetchBoundsAndPrepare = async () => {
    if (!store.artifactId || !store.groundTruthFileId) return;

    store.setValidationState({ validationLoading: true, validationError: null });

    try {
      // Fetch authoritative bounding box from the ground truth file
      const boundsResponse = await visualizationClient.getBounds(
        store.groundTruthFileId, 
        store.selectedVariable || "C13"
      );

      if (!boundsResponse.success || !boundsResponse.data) {
        throw new Error(boundsResponse.message || "Failed to retrieve bounds.");
      }

      store.setValidationState({
        validationLoading: false,
        validationPair: {
          generatedId: store.artifactId,
          groundTruthId: store.groundTruthFileId,
        },
        bounds: boundsResponse.data,
      });

      // NOTE: computeMetrics() is intentionally NOT called here.
      // It is triggered explicitly by the user advancing from Step 5 → 6.
      
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during preparation';
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
    prepareValidation: fetchBoundsAndPrepare,
    computeMetrics,
  };
}
