import { useValidationStore } from '@/store/validation-store';
import { validationClient } from '@/lib/api/validation-client';

export function useValidation() {
  const store = useValidationStore();

  const alignFrames = async () => {
    if (!store.artifactId || !store.groundTruthFileId) return;

    store.setValidationState({ validationLoading: true, validationError: null });

    try {
      const res = await validationClient.alignFrames({
        generated_file_id: store.artifactId,
        ground_truth_file_id: store.groundTruthFileId,
        variable: "C13",
      });

      if (res.success && res.data) {
        store.setValidationState({
          validationLoading: false,
          validationPair: {
            generatedId: res.data.generated_file_id,
            groundTruthId: res.data.ground_truth_file_id,
          },
          alignedGenerated: res.data.aligned_generated,
          alignedGroundTruth: res.data.aligned_ground_truth,
          differenceMap: res.data.difference_map,
        });

        // Trigger metrics computation immediately after alignment
        computeMetrics();
      } else {
        store.setValidationState({ 
          validationLoading: false, 
          validationError: res.message || 'Alignment failed' 
        });
      }
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
        variable: "C13",
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
