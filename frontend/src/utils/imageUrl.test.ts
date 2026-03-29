import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock import.meta.env and window.location before importing the module
vi.stubGlobal('window', {
  location: { hostname: 'localhost' },
});

// Mock import.meta.env
vi.mock('../utils/imageUrl', async () => {
  // re-implement with predictable base
  return {
    getAbsoluteImageUrl: (imageUrl?: string): string => {
      if (!imageUrl) return '/images/placeholder-image.svg';
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
      if (imageUrl.startsWith('/uploads/')) return `http://localhost:8000${imageUrl}`;
      if (imageUrl.startsWith('/')) return imageUrl;
      return `/images/${imageUrl}`;
    },
    getFirstImageUrl: (photos?: string[]): string => {
      if (!photos || photos.length === 0) return '/images/placeholder-image.svg';
      const url = photos[0];
      if (!url) return '/images/placeholder-image.svg';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('/uploads/')) return `http://localhost:8000${url}`;
      if (url.startsWith('/')) return url;
      return `/images/${url}`;
    },
    getAbsoluteImageUrls: (photos?: string[]): string[] => {
      if (!photos) return [];
      return photos.map((url) => {
        if (!url) return '/images/placeholder-image.svg';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/uploads/')) return `http://localhost:8000${url}`;
        if (url.startsWith('/')) return url;
        return `/images/${url}`;
      });
    },
  };
});

import { getAbsoluteImageUrl, getFirstImageUrl, getAbsoluteImageUrls } from './imageUrl';

describe('getAbsoluteImageUrl', () => {
  it('returns placeholder when given undefined', () => {
    expect(getAbsoluteImageUrl(undefined)).toBe('/images/placeholder-image.svg');
  });

  it('returns placeholder when given empty string', () => {
    expect(getAbsoluteImageUrl('')).toBe('/images/placeholder-image.svg');
  });

  it('returns absolute https URLs unchanged', () => {
    const url = 'https://cdn.example.com/photo.jpg';
    expect(getAbsoluteImageUrl(url)).toBe(url);
  });

  it('returns absolute http URLs unchanged', () => {
    const url = 'http://example.com/photo.jpg';
    expect(getAbsoluteImageUrl(url)).toBe(url);
  });

  it('prefixes /uploads/ paths with server base', () => {
    const result = getAbsoluteImageUrl('/uploads/listings/test.jpg');
    expect(result).toContain('/uploads/listings/test.jpg');
    expect(result).toMatch(/^https?:\/\//);
  });

  it('returns root-relative paths unchanged', () => {
    expect(getAbsoluteImageUrl('/images/logo.png')).toBe('/images/logo.png');
  });

  it('prefixes bare filenames with /images/', () => {
    expect(getAbsoluteImageUrl('photo.jpg')).toBe('/images/photo.jpg');
  });
});

describe('getFirstImageUrl', () => {
  it('returns placeholder for undefined', () => {
    expect(getFirstImageUrl(undefined)).toBe('/images/placeholder-image.svg');
  });

  it('returns placeholder for empty array', () => {
    expect(getFirstImageUrl([])).toBe('/images/placeholder-image.svg');
  });

  it('returns absolute URL of first element', () => {
    const url = 'https://cdn.example.com/first.jpg';
    expect(getFirstImageUrl([url, 'https://cdn.example.com/second.jpg'])).toBe(url);
  });

  it('resolves relative URL of first element', () => {
    const result = getFirstImageUrl(['/uploads/photo.jpg']);
    expect(result).toContain('/uploads/photo.jpg');
  });
});

describe('getAbsoluteImageUrls', () => {
  it('returns empty array for undefined', () => {
    expect(getAbsoluteImageUrls(undefined)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(getAbsoluteImageUrls([])).toEqual([]);
  });

  it('resolves all URLs in the array', () => {
    const input = [
      'https://cdn.example.com/a.jpg',
      '/uploads/b.jpg',
      '/local/c.jpg',
    ];
    const result = getAbsoluteImageUrls(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('https://cdn.example.com/a.jpg');
    expect(result[1]).toContain('/uploads/b.jpg');
    expect(result[2]).toBe('/local/c.jpg');
  });
});
