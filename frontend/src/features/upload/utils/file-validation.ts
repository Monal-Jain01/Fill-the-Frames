export const ALLOWED_EXTENSIONS = ['.nc', '.h5', '.hdf5'];
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export type FileValidationResult = {
  isValid: boolean;
  error?: string;
  fileType?: 'netcdf' | 'hdf5';
};

export function validateSatelliteFile(file: File): FileValidationResult {
  const fileName = file.name.toLowerCase();
  
  // Extension check
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Size check
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  // Determine type
  let fileType: 'netcdf' | 'hdf5' | undefined;
  if (fileName.endsWith('.nc')) fileType = 'netcdf';
  else if (fileName.endsWith('.h5') || fileName.endsWith('.hdf5')) fileType = 'hdf5';

  return {
    isValid: true,
    fileType,
  };
}
