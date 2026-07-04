// Image optimization utilities
export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
}

export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    quality = 80,
    maxWidth = 1200,
    format = 'webp',
  } = options;

  // If it's already an optimized URL, return as is
  if (originalUrl.includes('?')) {
    return originalUrl;
  }

  // Add optimization parameters
  const params = new URLSearchParams({
    q: quality.toString(),
    w: maxWidth.toString(),
    f: format,
  });

  return `${originalUrl}?${params.toString()}`;
}

export function getImageLoadingProps(options: ImageOptimizationOptions = {}) {
  return {
    loading: options.lazy !== false ? 'lazy' : 'eager',
    decoding: 'async',
    fetchPriority: options.lazy === false ? 'high' : 'auto',
  };
}

// WebP support detection
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') {return false;}
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Lazy load image observer
export function createImageIntersectionObserver(
  callback: (img: HTMLImageElement) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        callback(img);
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  });
  return observer;
}