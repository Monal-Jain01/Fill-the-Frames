import { create } from 'zustand';
import { validateSatelliteFile } from '@/features/upload/utils/file-validation';
import { apiClient } from '@/lib/api-client';

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

// 🚨 Yahan humne interface me naye functions add kiye hain
interface UploadStore {
  files: UploadFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  uploadFileToServer: (id: string) => Promise<void>;
  startAllReadyUploads: () => void;
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

  // 🚨 Yeh raha humara asli server upload function
  uploadFileToServer: async (id: string) => {
    const fileToUpload = get().files.find(f => f.id === id);
    if (!fileToUpload || fileToUpload.status !== 'ready') return;

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status: 'uploading', progress: 10 } : f
      ),
    }));

    try {
      const response = await apiClient.uploadFile(fileToUpload.file);
      
      if (response.success) {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { 
              ...f, 
              progress: 100, 
              status: 'completed', 
              uploadedAt: new Date() 
            } : f
          ),
        }));
      } else {
        throw new Error(response.message || "Upload failed from server");
      }
    } catch (error: any) {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === id ? { ...f, status: 'error', error: error.message } : f
        ),
      }));
    }
  },

  // 🚨 "Upload All" button ke liye
  startAllReadyUploads: () => {
    const { files, uploadFileToServer } = get();
    files.forEach((f) => {
      if (f.status === 'ready') {
        uploadFileToServer(f.id);
      }
    });
  },

  clearCompleted: () => {
    set((state) => ({
      files: state.files.filter((f) => f.status !== 'completed'),
    }));
  },
}));
