/**
 * Optimised site images (WebP), served from /public/images.
 *
 * Each photo has a small and a large version; the browser downloads only the one that
 * fits the screen (via srcSet + sizes). The originals stay in src/assets/images.
 * To replace a photo, regenerate these files at the same names and sizes.
 */

export const LOGO_SRC = '/images/logo-128.webp';

export const HERO_IMAGE = {
  src: '/images/hero-1376.webp',
  srcSet: '/images/hero-768.webp 768w, /images/hero-1376.webp 1376w',
  sizes: '100vw',
} as const;

export const ABOUT_IMAGE = {
  src: '/images/about-1200.webp',
  srcSet: '/images/about-700.webp 700w, /images/about-1200.webp 1200w',
  sizes: '(min-width: 1024px) 40vw, 100vw',
} as const;

/** Photos for the "Who We Serve" segments. */
export const SEGMENT_IMAGES = {
  sme: { src: '/images/sme-1200.webp', srcSet: '/images/sme-640.webp 640w, /images/sme-1200.webp 1200w' },
  entrepreneurs: { src: '/images/hero-1376.webp', srcSet: '/images/hero-768.webp 768w, /images/hero-1376.webp 1376w' },
  women: { src: '/images/women-1200.webp', srcSet: '/images/women-640.webp 640w, /images/women-1200.webp 1200w' },
  youth: { src: '/images/youth-1200.webp', srcSet: '/images/youth-640.webp 640w, /images/youth-1200.webp 1200w' },
} as const;

export const SEGMENT_IMAGE_SIZES = '(min-width: 1024px) 50vw, 100vw';
