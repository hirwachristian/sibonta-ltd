import { useEffect, type ReactNode } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from 'motion/react';

/** Smooth "ease-out" curve used for every entrance on the site. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, amount: 0.2 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/** Fades and rises a block into view the first time it scrolls on screen. */
export function Reveal({
  children,
  delay = 0,
  ...rest
}: { children: ReactNode; delay?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT, delay } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Container whose <RevealItem> children appear one after another. */
export function RevealGroup({
  children,
  stagger = 0.1,
  ...rest
}: { children: ReactNode; stagger?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Child of <RevealGroup>; inherits its timing. */
export const RevealItem = motion.div;

/** Shared hover "lift" for clickable cards. */
export const cardHover = { y: -4, transition: { duration: 0.2, ease: EASE_OUT } };

/** Number that glides to its new value instead of jumping. */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, format);

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration: 0.5, ease: EASE_OUT });
    return () => controls.stop();
  }, [value, reduceMotion, motionValue]);

  return <motion.span className={className}>{text}</motion.span>;
}
