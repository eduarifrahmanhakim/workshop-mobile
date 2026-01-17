/**
 * Image Compression Utility
 * Compresses images to target size and dimensions before upload
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
  quality?: number;
  acceptedFormats?: string[];
}

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  maxSizeMB: 1,
  quality: 0.8,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

/**
 * Validates if the file is an accepted image format
 */
export function isValidImageFormat(file: File, acceptedFormats: string[]): boolean {
  return acceptedFormats.includes(file.type);
}

/**
 * Creates an image element from a file
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let newWidth = width;
  let newHeight = height;

  // Scale down if exceeds max dimensions
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  return { width: newWidth, height: newHeight };
}

/**
 * Compress image using canvas
 */
async function compressWithCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality: number,
  mimeType: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use better image smoothing for quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Convert blob to File with original filename
 */
function blobToFile(blob: Blob, originalName: string, mimeType: string): File {
  // Generate new filename with proper extension
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove old extension
  const newName = `${baseName}.${extension}`;
  
  return new File([blob], newName, { type: mimeType, lastModified: Date.now() });
}

/**
 * Compress a single image file
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate format
  if (!isValidImageFormat(file, opts.acceptedFormats!)) {
    throw new Error(`Invalid image format. Accepted formats: ${opts.acceptedFormats!.join(', ')}`);
  }

  const originalSize = file.size;
  const maxSizeBytes = opts.maxSizeMB! * 1024 * 1024;

  // If file is already small enough and in acceptable format, return as-is
  if (originalSize <= maxSizeBytes && file.type !== 'image/png') {
    const img = await createImageFromFile(file);
    const { width, height } = calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      opts.maxWidth!,
      opts.maxHeight!
    );
    
    // If dimensions are also fine, return original
    if (img.naturalWidth <= opts.maxWidth! && img.naturalHeight <= opts.maxHeight!) {
      URL.revokeObjectURL(img.src);
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    }
  }

  // Load image
  const img = await createImageFromFile(file);
  
  // Calculate target dimensions
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxWidth!,
    opts.maxHeight!
  );

  // Use JPEG for better compression (unless PNG is required for transparency)
  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  
  let quality = opts.quality!;
  let blob: Blob;
  let attempts = 0;
  const maxAttempts = 10;

  // Iteratively reduce quality until file size is acceptable
  do {
    blob = await compressWithCanvas(img, width, height, quality, mimeType);
    
    if (blob.size <= maxSizeBytes) {
      break;
    }
    
    // Reduce quality for next iteration
    quality -= 0.1;
    attempts++;
  } while (quality > 0.1 && attempts < maxAttempts);

  // If still too large after quality reduction, reduce dimensions
  if (blob.size > maxSizeBytes) {
    let scaleFactor = 0.9;
    let newWidth = width;
    let newHeight = height;
    
    while (blob.size > maxSizeBytes && scaleFactor > 0.3) {
      newWidth = Math.round(width * scaleFactor);
      newHeight = Math.round(height * scaleFactor);
      blob = await compressWithCanvas(img, newWidth, newHeight, 0.7, mimeType);
      scaleFactor -= 0.1;
    }
  }

  // Cleanup
  URL.revokeObjectURL(img.src);

  const compressedFile = blobToFile(blob, file.name, mimeType);

  return {
    file: compressedFile,
    originalSize,
    compressedSize: compressedFile.size,
    width,
    height,
  };
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressOptions = {}
): Promise<CompressResult[]> {
  const results: CompressResult[] = [];
  
  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      throw error;
    }
  }
  
  return results;
}

/**
 * Format bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
