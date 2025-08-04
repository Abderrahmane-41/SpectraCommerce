/**
 * Transforms a Cloudinary URL to apply performance optimizations
 * @param url The original Cloudinary URL
 * @param width The desired width for the image
 * @param lazyLoad Whether to add lazy loading attribute
 * @returns The transformed URL string
 */
export const optimizeCloudinaryUrl = (url: string, width: number): string => {
  // Return unchanged if null, undefined, or not a Cloudinary URL
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Skip if already optimized
  if (url.includes('/f_auto,q_auto')) {
    return url;
  }

  // Extract the upload path and add transformations
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }

  return url;
};