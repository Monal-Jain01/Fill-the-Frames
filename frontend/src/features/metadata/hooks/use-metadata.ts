import { useState, useEffect } from 'react';
import { DetailedSatelliteMetadata, MetadataState } from '../types';
import { useUploadStore } from '@/store/upload-store';
import { metadataClient } from '@/lib/api';

/**
 * Hook to manage metadata state and fetching.
 */
export function useMetadata(fileIdProp?: string) {
  const [data, setData] = useState<DetailedSatelliteMetadata | null>(null);
  const [state, setState] = useState<MetadataState>('loading');
  const files = useUploadStore(state => state.files);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setState('loading');
        
        let targetFileId = fileIdProp;
        if (!targetFileId) {
          const completedFile = files.find(f => f.status === 'completed' && f.cloudFileId);
          targetFileId = completedFile?.cloudFileId;
        }

        if (!targetFileId) {
          setState('empty');
          return;
        }

        const response = await metadataClient.getMetadata(targetFileId);
        if (response.success && response.data) {
          setData(response.data as DetailedSatelliteMetadata);
          setState('ready');
        } else {
          throw new Error(response.message || "Failed to load metadata");
        }
      } catch (error) {
        console.error("Failed to load metadata:", error);
        setState('error');
      }
    };

    loadMetadata();
  }, [fileIdProp, files]);

  return {
    data,
    state,
  };
}