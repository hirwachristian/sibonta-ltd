import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { TARGET_CUSTOMER_SEGMENTS } from '../data/sibontaData';
import { AnimatePresence, motion } from 'motion/react';
import { ResilientImage } from './ResilientImage';
import { SEGMENT_IMAGE_SIZES } from '../config/images';
import { cardHover, EASE_OUT, fadeUp, Reveal, RevealGroup } from './motion/Reveal';

/** New photo fades in over the old one while settling from a slight zoom (no blank flash). */
const photoSwap = {
  initial: { opacity: 0, scale: 1.08 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0 },
  transition: { opacity: { duration: 0.7, ease: EASE_OUT }, scale: { duration: 1.2, ease: EASE_OUT } },
} as const;

/** Very slow "Ken Burns" drift while a photo is on screen. */
const photoDrift = {
  initial: { scale: 1 },
  animate: { scale: 1.06 },
  transition: { duration: 14, ease: 'linear', repeat: Infinity, repeatType: 'reverse' },
} as const;

const panelFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: EASE_OUT },
} as const;

interface TargetCustomersSectionProps {
  onSelectSegmentForInquiry: (segmentTitle: string, primaryNeed: string) => void;
}

export function TargetCustomersSection({
  onSelectSegmentForInquiry,
}: TargetCustomersSectionProps) {
  const [activeSegmentId, setActiveSegmentId] = useState<string>(TARGET_CUSTOMER_SEGMENTS[0].id);

  // Once the page has loaded, quietly fetch the other segments' photos so switching tabs is instant.
  useEffect(() => {
    const preload = () =>
      TARGET_CUSTOMER_SEGMENTS.forEach((seg) => {
        const img = new Image();
        img.decoding = 'async';
        if (seg.imageSrcSet) {
          img.sizes = SEGMENT_IMAGE_SIZES;
          img.srcset = seg.imageSrcSet;
        }
        img.src = seg.imageUrl;
      });
    const idle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(preload);
      else setTimeout(preload, 1500);
    };
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
    return () => window.removeEventListener('load', idle);
  }, []);

  const activeSegment =
    TARGET_CUSTOMER_SEGMENTS.find((seg) => seg.id === activeSegmentId) ||
    TARGET_CUSTOMER_SEGMENTS[0];

  return (
    <section id="who-we-serve" className="py-20 sm:py-24 bg-[#F4F8FB]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <Reveal className="max-w-2xl">
          <p className="text-sm font-medium text-[#C27803] tracking-wide mb-2">
            Our Target Customers
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight text-balance">
            Financial inclusion designed for real enterprises and everyday ambition
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Whether you are starting a business, expanding an established enterprise, overcoming
            financial challenges, or building greater financial independence, our support adapts to
            your stage.
          </p>
        </Reveal>

        {/* Interactive Segment Selector Strip */}
        <RevealGroup
          role="tablist"
          aria-label="Customer segments served by SIBONTA Finance Ltd"
          className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {TARGET_CUSTOMER_SEGMENTS.map((segment) => {
            const isActive = segment.id === activeSegment.id;
            return (
              <motion.button
                key={segment.id}
                variants={fadeUp}
                whileHover={cardHover}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSegmentId(segment.id)}
                className={`text-left p-5 rounded-xl border hover:shadow-lg hover:shadow-slate-900/5 transition-[background-color,border-color,box-shadow] duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#FFFDF7] border-[#082E43] shadow-xs'
                    : 'bg-[#E6F0F5]/60 border-slate-200 hover:bg-[#FFFDF7] hover:border-slate-300'
                }`}
              >
                <span className="font-mono text-xs font-semibold text-[#C27803] tabular-nums">
                  {segment.number}.
                </span>
                <p
                  className={`mt-1.5 text-base font-semibold tracking-tight ${
                    isActive ? 'text-[#082E43]' : 'text-slate-800'
                  }`}
                >
                  {segment.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{segment.focusSummary}</p>
              </motion.button>
            );
          })}
        </RevealGroup>

        {/* Active Segment Detail Split (2-column balanced stretch) */}
        <Reveal className="mt-8 bg-[#FFFDF7] border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Editorial Photo: wipes in on first view, crossfades between segments, drifts slowly */}
          <div className="lg:col-span-6 relative h-[280px] sm:h-[360px] lg:h-auto lg:min-h-[460px] overflow-hidden bg-[#E3EEF4]">
            <AnimatePresence initial={false}>
              <motion.div key={activeSegment.id} {...photoSwap} className="absolute inset-0">
                <motion.div {...photoDrift} className="w-full h-full">
                  <ResilientImage
                    src={activeSegment.imageUrl}
                    srcSet={activeSegment.imageSrcSet}
                    sizes={SEGMENT_IMAGE_SIZES}
                    width={1200}
                    height={896}
                    alt={activeSegment.imageAlt}
                    fallbackTitle={activeSegment.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Soft ink gradient so the caption stays readable */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#082E43]/75 via-[#082E43]/25 to-transparent"
            />

            {/* Caption slides up with each segment */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSegment.id}
                aria-hidden="true"
                className="absolute left-5 right-5 bottom-6 sm:left-7 sm:bottom-7 text-white"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.25, ease: EASE_OUT } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
              >
                <span className="font-mono text-xs font-semibold text-[#EAB308] tabular-nums">
                  {activeSegment.number}.
                </span>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-semibold tracking-tight">
                  {activeSegment.title}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Gold accent line sweeps across on each change */}
            <motion.span
              key={`line-${activeSegment.id}`}
              aria-hidden="true"
              className="absolute left-0 bottom-0 h-1 w-full bg-[#C27803] origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}
            />

            {/* Ice-blue curtain slides away the first time the photo scrolls into view */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 z-10 bg-[#C9DFEA] origin-right"
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.1, delay: 0.1, ease: EASE_OUT }}
            />
          </div>

          {/* Segment Details & Solutions */}
          <motion.div
            key={activeSegment.id}
            {...panelFade}
            className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
                <span className="font-mono tabular-nums text-[#082E43] font-semibold">
                  {activeSegment.number}.
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeSegment.title}</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
                {activeSegment.headline}
              </h3>

              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {activeSegment.narrative}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 tracking-wide mb-3">
                  Tailored SIBONTA Solutions
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSegment.recommendedSolutions.map((solution) => (
                    <li
                      key={solution}
                      className="flex items-start gap-2 text-sm font-medium text-slate-800"
                    >
                      <Check
                        className="w-4 h-4 text-[#073035] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                {activeSegment.focusSummary}
              </p>
              <button
                type="button"
                onClick={() =>
                  onSelectSegmentForInquiry(activeSegment.title, activeSegment.primaryNeed)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082E43]"
              >
                <span>Start {activeSegment.title} Inquiry</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
