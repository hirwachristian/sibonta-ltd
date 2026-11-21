import { useEffect, useRef } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Seconds the count takes. */
  duration?: number;
  className?: string;
}

/** A number that counts up from 0 every time it scrolls into view (and resets when it leaves). */
export function CountUp({ value, prefix = '', suffix = '', duration = 1.8, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString('en-US')}${suffix}`);

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    if (!inView) {
      // Reset while off screen so the count replays on the next visit.
      count.set(0);
      return;
    }
    count.set(0);
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduceMotion, value, duration, count]);

  const finalText = `${prefix}${value.toLocaleString('en-US')}${suffix}`;

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {/* Screen readers hear the final number once, not every step of the count. */}
      <span className="sr-only">{finalText}</span>
      <motion.span aria-hidden="true">{text}</motion.span>
    </span>
  );
}
