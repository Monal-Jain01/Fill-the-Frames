import { create } from 'zustand';
import { validateSatelliteFile } from '@/features/upload/utils/file-validation';

export type UploadStatus = 'pending' | 'validating' | 'ready' | 'uploading' | 'completed' | 'error';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  uploadedAt?: Date;
  fileType?: 'netcdf' | 'hdf5';
}

interface UploadStore {
  files: UploadFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  simulateUpload: (id: string) => void;
  simulateAllReady: () => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  files: [],

  addFiles: (newFiles) => {
    set((state) => {
      const addedFiles: UploadFile[] = newFiles.map((file) => {
        const id = Math.random().toString(36).substring(2, 9);
        const validation = validateSatelliteFile(file);
        
        return {
          id,
          file,
          progress: 0,
          status: validation.isValid ? 'ready' : 'error',
          error: validation.error,
          fileType: validation.fileType,
        };
      });

      return { files: [...state.files, ...addedFiles] };
    });
  },

  removeFile: (id) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }));
  },

  simulateUpload: (id) => {
    const fileToUpload = get().files.find(f => f.id === id);
    if (!fileToUpload || fileToUpload.status !== 'ready') return;

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status: 'uploading' } : f
      ),
    }));

    // Mock progress interval
    const interval = setInterval(() => {
      set((state) => {
        const currentFile = state.files.find((f) => f.id === id);
        if (!currentFile || currentFile.status !== 'uploading') {
          clearInterval(interval);
          return state;
        }

        const newProgress = Math.min(currentFile.progress + 10 + Math.random() * 15, 100);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            files: state.files.map((f) =>
              f.id === id ? { ...f, progress: 100, status: 'completed', uploadedAt: new Date() } : f
            ),
          };
        }

        return {
          files: state.files.map((f) =>
            f.id === id ? { ...f, progress: newProgress } : f
          ),
        };
      });
    }, 500);
  },

  simulateAllReady: () => {
    const { files, simulateUpload } = get();
    files.forEach((f) => {
      if (f.status === 'ready') {
        simulateUpload(f.id);
      }
    });
  },

  clearCompleted: () => {
    set((state) => ({
      files: state.files.filter((f) => f.status !== 'completed'),
    }));
  },
}));
