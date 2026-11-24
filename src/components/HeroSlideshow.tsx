import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ResilientImage } from './ResilientImage';
import { HERO_SLIDES } from '../config/images';

/** How long each photo stays on screen, and how long the crossfade takes (seconds). */
const SLIDE_SECONDS = 7;
const FADE_SECONDS = 1.6;

/** Loads an image (the size the browser would pick) and resolves once it can be shown. */
function preload(slide: (typeof HERO_SLIDES)[number]) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.sizes = slide.sizes;
    img.srcset = slide.srcSet;
    img.src = slide.src;
    img.onload = img.onerror = () => resolve();
  });
}

/**
 * Full-bleed background for the welcome section.
 * Each photo fades in while slowly zooming out, then gently zooms in as the next one covers it.
 * The first photo shows immediately; the others start only after the page has fully loaded,
 * so they never slow down the first view. With "reduce motion" on, only the first photo is shown.
 */
export function HeroSlideshow() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const firstPaint = useRef(true);

  // Fetch the other photos once the page has loaded and the browser is idle.
  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    const start = () =>
      Promise.all(HERO_SLIDES.slice(1).map(preload)).then(() => !cancelled && setReady(true));
    const idle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start);
      else setTimeout(start, 1200);
    };
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', idle);
    };
  }, [reduceMotion]);

  // Move to the next photo every few seconds (paused while the tab is hidden).
  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        firstPaint.current = false;
        setIndex((i) => (i + 1) % HERO_SLIDES.length);
      }
    }, SLIDE_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [ready]);

  const slide = HERO_SLIDES[index];
  const isFirst = firstPaint.current && index === 0;

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden={index !== 0 || undefined}>
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          // The first photo is visible straight away (fast first paint); later ones fade in.
          initial={{ opacity: isFirst ? 1 : 0, scale: 1.1, zIndex: 1 }}
          animate={{
            opacity: 1,
            scale: 1,
            zIndex: 1,
            transition: {
              opacity: { duration: FADE_SECONDS, ease: 'easeInOut' },
              scale: { duration: SLIDE_SECONDS + FADE_SECONDS, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          // The outgoing photo stays underneath and zooms in slightly while it is covered.
          exit={{
            scale: 1.06,
            zIndex: 0,
            transition: { duration: FADE_SECONDS, ease: 'easeInOut' },
          }}
        >
          <ResilientImage
            src={slide.src}
            srcSet={slide.srcSet}
            sizes={slide.sizes}
            loading="eager"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            width={1376}
            height={768}
            alt={slide.alt}
            fallbackTitle="SIBONTA Finance Ltd"
            className="w-full h-full object-cover"
            style={{ objectPosition: slide.position, transform: 'mirror' in slide && slide.mirror ? 'scaleX(-1)' : undefined }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
