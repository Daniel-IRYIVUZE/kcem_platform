/**
 * frontend/src/utils/imageUrl.ts
 * Converts relative image URLs to absolute URLs for display
 */

const PROD_API_BASE = 'https://api.ecotrade-rwanda.com/api';

function resolveApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }

  return PROD_API_BASE;
}

const API_BASE = resolveApiBase();

/**
 * Get the base server URL (without /api suffix)
 */
function getServerBase(): string {
  return API_BASE.replace('/api', '');
}

/**
 * Converts a relative image URL to an absolute URL
 * @param imageUrl - Relative path like "/uploads/listings/abc123.jpg" or full URL
 * @returns Absolute URL suitable for <img src> tag
 */
export function getAbsoluteImageUrl(imageUrl?: string): string {
  if (!imageUrl) {
    return '/images/placeholder-image.svg';
  }

  // Already an absolute URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Relative URL from backend (/uploads/...)
  if (imageUrl.startsWith('/uploads/')) {
    return `${getServerBase()}${imageUrl}`;
  }

  // Relative local path
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Fallback
  return `/images/${imageUrl}`;
}

/**
 * Get first image from photos array, or placeholder
 * @param photos - Array of image URLs
 * @returns Absolute URL of first image, or placeholder
 */
export function getFirstImageUrl(photos?: string[]): string {
  if (!photos || photos.length === 0) {
    return '/images/placeholder-image.svg';
  }
  return getAbsoluteImageUrl(photos[0]);
}

/**
 * Get all images as absolute URLs
 * @param photos - Array of image URLs
 * @returns Array of absolute URLs
 */
export function getAbsoluteImageUrls(photos?: string[]): string[] {
  if (!photos) return [];
  return photos.map(getAbsoluteImageUrl);
}
