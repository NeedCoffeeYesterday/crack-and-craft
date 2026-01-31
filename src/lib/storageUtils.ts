// Storage quota utilities for localStorage management

const MAX_VOICE_NOTE_SIZE = 500000; // 500KB per voice note (base64)
const STORAGE_WARNING_THRESHOLD = 0.8; // Warn at 80% usage
const ESTIMATED_QUOTA = 5 * 1024 * 1024; // 5MB typical localStorage limit

export interface StorageStatus {
  used: number;
  estimated: number;
  percentage: number;
  isNearLimit: boolean;
}

/**
 * Calculates approximate localStorage usage
 */
export const getStorageUsage = (): StorageStatus => {
  let totalSize = 0;
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage.getItem(key)?.length || 0;
      totalSize += key.length;
    }
  }
  
  // Convert to bytes (UTF-16 encoding = 2 bytes per char)
  const usedBytes = totalSize * 2;
  const percentage = usedBytes / ESTIMATED_QUOTA;
  
  return {
    used: usedBytes,
    estimated: ESTIMATED_QUOTA,
    percentage,
    isNearLimit: percentage >= STORAGE_WARNING_THRESHOLD,
  };
};

/**
 * Formats bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Validates voice note size before storage
 * @throws Error if voice note exceeds size limit
 */
export const validateVoiceNoteSize = (base64Data: string): void => {
  if (base64Data.length > MAX_VOICE_NOTE_SIZE) {
    const actualSize = formatBytes(base64Data.length);
    const maxSize = formatBytes(MAX_VOICE_NOTE_SIZE);
    throw new Error(`Voice note too large (${actualSize}). Maximum size is ${maxSize}. Try recording a shorter note.`);
  }
};

/**
 * Checks if adding data would exceed storage quota
 * @throws Error if storage would exceed limit
 */
export const checkStorageQuota = (additionalBytes: number): void => {
  const status = getStorageUsage();
  const newUsage = status.used + additionalBytes;
  
  if (newUsage >= ESTIMATED_QUOTA * 0.95) {
    throw new Error('Storage is almost full. Please delete some old roasts to make room.');
  }
};

/**
 * Validates and checks both voice note size and storage quota
 * @throws Error if validation fails
 */
export const validateVoiceNoteStorage = (base64Data: string): void => {
  validateVoiceNoteSize(base64Data);
  checkStorageQuota(base64Data.length * 2);
};

export const MAX_VOICE_NOTE_BYTES = MAX_VOICE_NOTE_SIZE;
