import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/images/sibontaltd-logo-noring.png';
import { SHOW_LOAN_PLANNER } from '../config/features';

/** Which nav section is currently on screen, so its link can stay highlighted. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector('header');
      // A section counts as "current" once its top passes this line.
      const line = (header?.getBoundingClientRect().height ?? 64) + window.innerHeight * 0.3;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      let current = ids[0];
      for (const id of ids) {
        if (id === 'top') continue;
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (atBottom) current = ids[ids.length - 1];
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids.join('|')]);

  return active;
}

interface NavbarProps {
  onApplyForLoan: () => void;
  onOpenFaq: () => void;
}

const NAV_LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#services', label: 'Products & Services' },
  ...(SHOW_LOAN_PLANNER ? [{ href: '#estimator', label: 'Loan Planner' }] : []),
  { href: '#about', label: 'About Us' },
  { href: '#who-we-serve', label: 'Who We Serve' },
  { href: '#consultation', label: 'Contact Us' },
];

export function Navbar({ onApplyForLoan, onOpenFaq }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(NAV_LINKS.map((link) => link.href.slice(1)));

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const handleFaqClick = () => {
    setMobileOpen(false);
    onOpenFaq();
  };

  const handleApplyClick = () => {
    setMobileOpen(false);
    onApplyForLoan();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-sm border-b border-slate-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        {/* Zone 1: Brand logo */}
        <a
          href="#top"
          className="shrink-0 justify-self-start rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#082E43]"
        >
          <img
            src={logo}
            alt="SIBONTA Finance Ltd"
            width={56}
            height={56}
            className="h-14 w-14"
          />
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center justify-center gap-8 text-sm font-medium text-slate-600"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'location' : undefined}
                className={`transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#082E43] ${
                  isActive
                    ? 'text-[#082E43] border-[#C27803]'
                    : 'border-transparent hover:text-[#082E43] hover:border-[#C27803]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={handleFaqClick}
            className="hover:text-[#082E43] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#C27803] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#082E43]"
          >
            FAQs
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0 justify-self-end">
          <button
            type="button"
            onClick={handleApplyClick}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C27803]"
          >
            Apply for a Loan
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082E43]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-[#FFFDF7] px-4 py-4 space-y-2">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  aria-current={isActive ? 'location' : undefined}
                  className={`px-3 py-3 text-base rounded-lg border-l-4 transition-colors ${
                    isActive
                      ? 'border-[#C27803] bg-[#F4F8FB] font-semibold text-[#082E43]'
                      : 'border-transparent font-medium text-slate-700 hover:text-[#082E43] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <button
              type="button"
              onClick={handleFaqClick}
              className="px-3 py-3 text-left text-base font-medium text-slate-700 hover:text-[#082E43] hover:bg-slate-50 rounded-lg border-l-4 border-transparent transition-colors cursor-pointer"
            >
              FAQs
            </button>
          </nav>
          <div className="pt-2 border-t border-slate-100 grid gap-2">
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors cursor-pointer"
            >
              Apply for a Loan
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
