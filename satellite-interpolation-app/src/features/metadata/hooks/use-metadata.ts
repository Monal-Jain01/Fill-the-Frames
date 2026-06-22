import { useState, useEffect } from 'react';
import { DetailedSatelliteMetadata, MetadataState } from '../types';
import { mockMetadata } from '../mock/data';

/**
 * Hook to manage metadata state and fetching.
 * Currently returns mock data, but designed to connect to global stores or APIs in the future.
 */
export function useMetadata(initialData?: DetailedSatelliteMetadata) {
  const [data, setData] = useState<DetailedSatelliteMetadata | null>(initialData || null);
  const [state, setState] = useState<MetadataState>(initialData ? 'ready' : 'loading');

  useEffect(() => {
    if (initialData) {
      const timer = setTimeout(() => setData(initialData), 0);
      return () => clearTimeout(timer);
    }

    // Simulate an async operation (e.g., parsing a NetCDF file or calling a backend API)
    const loadMetadata = async () => {
      try {
        setState('loading');
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In the future, this would check `useUploadStore.getState().selectedFileMetadata`
        setData(mockMetadata);
        setState('ready');
      } catch {
        setState('error');
      }
    };

    loadMetadata();
  }, [initialData]);

  return {
    data,
    state,
  };
}
