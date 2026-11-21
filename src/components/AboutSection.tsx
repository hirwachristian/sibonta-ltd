import { motion } from 'motion/react';
import aboutImage from '../assets/images/aboutus-web.jpg';
import { fadeUp, Reveal, RevealGroup } from './motion/Reveal';
import { CountUp } from './motion/CountUp';
import { COMPANY_STATS } from '../data/sibontaData';

const VALUES = [
  {
    title: 'Responsible Lending',
    text: 'We lend around real cash flow, so every repayment plan is one you can comfortably keep.',
  },
  {
    title: 'Financial Inclusion',
    text: 'We open doors for those often underserved, including SMEs, entrepreneurs, women, and young people.',
  },
  {
    title: 'Integrity & Transparency',
    text: 'Clear terms, honest advice, and no surprises, from your first conversation to your final repayment.',
  },
  {
    title: 'Partnership for Growth',
    text: 'Your ambitions matter. We stay beside you with guidance as your business and goals grow.',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-24 bg-[#E6F0F5] border-t border-slate-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Intro: story + commitment card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <Reveal className="lg:col-span-7">
            <p className="text-sm font-medium text-[#C27803] tracking-wide mb-2">About Us</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight text-balance">
              Empowering people and businesses to build a brighter financial future
            </h2>

            <div className="mt-6 space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed">
              <p>
                At SIBONTA Finance Ltd, we believe that access to the right financial solutions can
                transform lives, strengthen businesses, and create lasting opportunities.
              </p>
              <p>
                We are committed to empowering small and medium-sized enterprises (SMEs), individual
                entrepreneurs, women, and young people through accessible financial services,
                responsible lending, professional financial advisory, and debt counselling.
              </p>
              <p>
                Whether you are starting a business, expanding your enterprise, overcoming financial
                challenges, or working towards greater financial independence, we are here to help you
                unlock your potential and achieve your goals.
              </p>
            </div>

          </Reveal>

          {/* Commitment card */}
          <Reveal delay={0.15} className="lg:col-span-5">
            <figure className="group relative isolate flex flex-col justify-end min-h-[420px] lg:min-h-[480px] overflow-hidden rounded-2xl bg-[#082E43] text-[#FFFDF7] p-8 sm:p-10">
              {/* Background photo with an ink overlay so the text stays readable */}
              <img
                src={aboutImage}
                alt=""
                loading="lazy"
                className="absolute inset-0 -z-20 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-[#082E43] via-[#082E43]/80 to-[#082E43]/30"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EAB308]">
                Our Commitment
              </p>

              <blockquote className="mt-4">
                <p className="font-display text-2xl sm:text-[1.7rem] leading-snug text-balance">
                  “Your ambitions matter, your growth is our priority, and your brighter financial
                  future is our commitment.”
                </p>
              </blockquote>

              <figcaption className="mt-8 pt-5 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <span className="font-semibold">SIBONTA Finance Ltd</span>
                <span className="text-[#C9DFEA]/90">Kicukiro, Kigali · Rwanda</span>
              </figcaption>
            </figure>

            {/* Key figures (count up when scrolled into view) */}
            <RevealGroup stagger={0.1} className="mt-8 grid grid-cols-3 gap-4 sm:gap-8 px-1">
              {COMPANY_STATS.map((stat) => (
                <motion.div key={stat.label} variants={fadeUp}>
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#082E43] leading-none">
                    <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-sm sm:text-base text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </RevealGroup>
          </Reveal>
        </div>

        {/* Mission & Vision */}
        <RevealGroup stagger={0.12} className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div variants={fadeUp} className="relative p-7 sm:p-8 rounded-2xl bg-[#FFFDF7] border border-slate-200 overflow-hidden">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#C27803]" />
            <p className="font-mono text-xs font-semibold text-[#C27803] tracking-wider uppercase">Our Mission</p>
            <p className="mt-3 text-base sm:text-lg text-slate-800 leading-relaxed">
              To promote financial inclusion, foster entrepreneurship, and support sustainable economic
              growth by providing practical, customer-focused financial solutions that help individuals
              and businesses thrive.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="relative p-7 sm:p-8 rounded-2xl bg-[#FFFDF7] border border-slate-200 overflow-hidden">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#073035]" />
            <p className="font-mono text-xs font-semibold text-[#073035] tracking-wider uppercase">Our Vision</p>
            <p className="mt-3 text-base sm:text-lg text-slate-800 leading-relaxed">
              A future where every entrepreneur, business, and household has the financial access,
              knowledge, and support they need to grow with confidence and build lasting prosperity.
            </p>
          </motion.div>
        </RevealGroup>

        {/* Values */}
        <div className="mt-16">
          <Reveal>
            <h3 className="font-display text-2xl font-semibold text-slate-900 tracking-tight">
              What we stand for
            </h3>
          </Reveal>
          <RevealGroup stagger={0.08} className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="p-6 rounded-xl bg-[#FFFDF7]/70 border border-slate-200"
              >
                <p className="font-mono text-xs font-semibold text-[#C27803] tabular-nums">
                  {String(i + 1).padStart(2, '0')}.
                </p>
                <h4 className="mt-2 text-base font-semibold text-[#082E43]">{v.title}</h4>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </RevealGroup>
        </div>

      </div>
    </section>
  );
}
