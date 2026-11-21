import { useEffect } from 'react';
import { animate, type AnimationPlaybackControls } from 'motion';

/** Gentle ease-in-out: starts softly, glides, then settles. */
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
/** Space left between the sticky navbar and the top of the section. */
const GAP_BELOW_NAVBAR = 16;

let current: AnimationPlaybackControls | null = null;
let detach: () => void = () => {};

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function targetY(id: string): number | null {
  if (id === 'top') return 0;
  const el = document.getElementById(id);
  if (!el) return null;
  const navbar = document.querySelector('header');
  const offset = (navbar?.getBoundingClientRect().height ?? 0) + GAP_BELOW_NAVBAR;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset), maxY);
}

/** Smoothly scroll up or down to the element with this id. */
export function scrollToId(id: string) {
  const to = targetY(id);
  if (to === null) return;

  stopCurrent();
  const from = window.scrollY;
  const distance = Math.abs(to - from);
  if (distance < 2) return;

  history.pushState(null, '', id === 'top' ? location.pathname + location.search : `#${id}`);

  if (prefersReducedMotion()) {
    window.scrollTo(0, to);
    return;
  }

  // Longer trips take a little longer, but never feel slow.
  const duration = Math.min(1.4, Math.max(0.6, 0.45 + distance / 3500));

  // Let the visitor take over: any manual scroll cancels the animation.
  const events = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
  const cancel = () => stopCurrent();
  events.forEach((e) => window.addEventListener(e, cancel, { passive: true }));
  detach = () => events.forEach((e) => window.removeEventListener(e, cancel));

  current = animate(from, to, {
    duration,
    ease: EASE_IN_OUT,
    onUpdate: (y) => window.scrollTo(0, y),
    onComplete: () => {
      detach();
      current = null;
    },
  });
}

function stopCurrent() {
  current?.stop();
  current = null;
  detach();
}

/** Makes every in-page link (href="#section") use the smooth scroll. */
export function useSmoothAnchorScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute('href')!.slice(1));
      if (!id || (id !== 'top' && !document.getElementById(id))) return;
      event.preventDefault();
      // Wait one frame so things like the mobile menu can close first,
      // then measure where the section really is.
      requestAnimationFrame(() => scrollToId(id));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
