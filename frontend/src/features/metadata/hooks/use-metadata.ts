import { useCallback } from "react";
import { metadataClient } from "@/lib/api/metadata-client";
import { useInterpolationStore } from "@/store/interpolation-store";
import { useValidationStore } from "@/store/validation-store";

export function useMetadata() {
  const interpolationStore = useInterpolationStore();
  const validationStore = useValidationStore();

  const fetchInterpolationMetadata = useCallback(
    async (fileId: string, type: "t0" | "t1") => {
      if (!fileId) {
        console.error(`Metadata requested without fileId for type: ${type}`);
        interpolationStore.setMetadataState({ metadataError: "Missing file ID", metadataLoading: false });
        return;
      }
      interpolationStore.setMetadataState({ metadataLoading: true, metadataError: null });
      try {
        const response = await metadataClient.getMetadata(fileId);
        if (response.success && response.data) {
          if (type === "t0") {
            interpolationStore.setMetadataState({ t0Metadata: response.data, metadataLoading: false });
          } else {
            interpolationStore.setMetadataState({ t1Metadata: response.data, metadataLoading: false });
          }
        } else {
          interpolationStore.setMetadataState({ 
            metadataError: response.message || "Failed to fetch metadata",
            metadataLoading: false 
          });
        }
      } catch (err: unknown) {
        interpolationStore.setMetadataState({ 
          metadataError: err instanceof Error ? err.message : "An unexpected error occurred",
          metadataLoading: false 
        });
      }
    },
    [interpolationStore]
  );

  const fetchValidationMetadata = useCallback(
    async (fileId: string) => {
      if (!fileId) {
        console.error("Validation metadata requested without fileId");
        validationStore.setMetadataState({ metadataError: "Missing file ID", metadataLoading: false });
        return;
      }
      validationStore.setMetadataState({ metadataLoading: true, metadataError: null });
      try {
        const response = await metadataClient.getMetadata(fileId);
        if (response.success && response.data) {
          validationStore.setMetadataState({ groundTruthMetadata: response.data, metadataLoading: false });
        } else {
          validationStore.setMetadataState({ 
            metadataError: response.message || "Failed to fetch metadata",
            metadataLoading: false 
          });
        }
      } catch (err: unknown) {
        validationStore.setMetadataState({ 
          metadataError: err instanceof Error ? err.message : "An unexpected error occurred",
          metadataLoading: false 
        });
      }
    },
    [validationStore]
  );

  return {
    fetchInterpolationMetadata,
    fetchValidationMetadata,
  };
}
