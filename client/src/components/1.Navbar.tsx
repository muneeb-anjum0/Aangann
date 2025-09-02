import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import logoMark from "../assets/navbar/aangan-logo-mark.svg";
import textLogo from "../assets/navbar/aangan-text-logo.png";

type NavItem = { label: string; href: string };
const navItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Community", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

const toId = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

const Navbar: React.FC<{ section: 'home' | 'community' | 'pricing'; setSection: (s: 'home' | 'community' | 'pricing') => void }> = ({ section, setSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [active, setActive] = useState<string>(toId("Home"));

  // Smoothly scroll to the section, adjusting for navbar height
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    const nav = navRef.current;
    if (el) {
      const navHeight = nav ? nav.offsetHeight : 0;
      // Decrease offset for 'community' section, increase for 'waitlist'
      let extraOffset = 60;
      if (id === 'testimonials' || id === 'community') {
        extraOffset = 20; // less offset for community
      } else if (id === 'waitlist') {
        extraOffset = 12; // less offset for waitlist
      }
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - navHeight + extraOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const navRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  // These refs help avoid unnecessary state updates
  const scrolledRef = useRef<boolean>(false);
  const activeRef = useRef<string>(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  // Sync active state with parent section
  useEffect(() => {
    if (section && section !== active) {
      setActive(section === "home" ? toId("Home") : section);
    }
  }, [section]);

  // Add shadow and background to navbar when scrolling
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

  // Only update shadow if it actually changed
    const apply = (v: boolean) => {
      if (scrolledRef.current !== v) {
        scrolledRef.current = v;
        setScrolled(v);
      }
    };

  // Listen to scroll for atTop detection
    const handleScroll = () => {
      setAtTop(window.scrollY === 0);
      apply(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

  // Use IntersectionObserver for shadow when scrolled
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position: static; height: 1px; width: 1px; pointer-events:none; opacity:0;";
    el.parentElement?.insertBefore(sentinel, el.nextSibling);

    const computeRootMargin = () => `-${el.offsetHeight}px 0px 0px 0px`;

  let io: IntersectionObserver | null = null;
    const makeObserver = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => apply(!entries[0].isIntersecting),
        { root: null, rootMargin: computeRootMargin(), threshold: 0 }
      );
      io.observe(sentinel);
    };

    let ro = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => makeObserver());
      ro.observe(el);
    }

    if ("IntersectionObserver" in window) {
      makeObserver();
    }

    return () => {
      io?.disconnect();
      ro?.disconnect();
      sentinel.remove();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock scroll and trap focus when mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, width: style.width };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    firstLinkRef.current?.focus();

    const keyHandler = (e: KeyboardEvent) => {
      if (!menuRef.current) return;
      if (e.key === "Escape") {
        setMenuOpen(false);
        setTimeout(() => burgerRef.current?.focus(), 0);
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (current === first || !menuRef.current.contains(current)) { last.focus(); e.preventDefault(); }
      } else {
        if (current === last || !menuRef.current.contains(current)) { first.focus(); e.preventDefault(); }
      }
    };

    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      style.position = prev.position; style.top = prev.top; style.width = prev.width;
      const y = prev.top ? -parseInt(prev.top, 10) : 0;
      window.scrollTo(0, y);
      burgerRef.current?.focus();
    };
  }, [menuOpen]);

  // We highlight the active section based on what the parent tells us

  // Set active section from URL hash on load
  useEffect(() => {
    const setFromHash = () => {
      const id = window.location.hash.replace("#", "");
      if (id && id !== activeRef.current) { activeRef.current = id; setActive(id); }
    };
    setFromHash();
    const onHash = () => { setFromHash(); setMenuOpen(false); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Navbar floats over content (no body padding)

  // Waitlist button with glass effect

  // Visual glass layers for waitlist button

  // Waitlist button label with arrow
  // ...existing code...

  return (
    <>
  {/* Style for transparent navbar at top */}
      <style>{`
        .navbar-at-top {
          background: transparent !important;
          box-shadow: none !important;
          border-bottom: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
        }
      `}</style>
      <motion.nav
        id="navbar"
        data-navbar
        ref={navRef}
        role="navigation"
        aria-label="Primary"
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 18,
          mass: 0.7,
          delay: 0.05,
          bounce: 0.45,
          duration: 0.55
        }}
        className={[
          "fixed top-0 left-0 w-full z-50 h-14 md:h-20",
          "transition-all duration-500 ease-in-out",
          scrolled
            ? [
                // Blurred, semi-transparent background when scrolled (no border)
                "bg-white/40 shadow-sm backdrop-blur-md backdrop-saturate-150",
                "md:bg-white/20 md:backdrop-blur-lg md:backdrop-saturate-200 md:shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
              ].join(" ")
            : "bg-transparent",
          atTop ? "navbar-at-top" : ""
        ].join(" ")}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="container mx-auto h-full px-4 md:px-6">
          <div className="flex h-full items-center relative">
            {/* Brand logo and text */}
            <a
              href="#home"
              className="flex items-center gap-2 md:gap-3 z-10"
              onClick={(e) => {
                e.preventDefault();
                setActive(toId('Home'));
                setSection('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="flex items-center gap-2 md:gap-3">
                <img
                  src={logoMark}
                  alt="Aangan logo mark"
                  className="h-8 w-auto md:h-11"
                  width={44}
                  height={44}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                />
                <img
                  src={textLogo}
                  alt="Aangan text logo"
                  className="h-5 w-auto md:h-8 block shrink-0 relative top-[7px]"
                  width={120}
                  height={24}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                />
              </span>
            </a>

            {/* Desktop navigation links centered */}
            <ul className="hidden md:flex items-center md:space-x-10 lg:space-x-16 xl:space-x-20 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {navItems.map(({ label, href }) => {
                const id = toId(label);
                const isActive = active === id;
                return (
                  <li key={label} className="flex items-center">
                    <a
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={(e) => {
                        if (href.startsWith("#")) {
                          e.preventDefault();
                          setActive(id);
                          // update shared navbar section context
                          if (id === 'home') setSection('home');
                          else if (id === 'community') setSection('community');
                          else if (id === 'pricing') setSection('pricing');

                          if (id === 'home') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            scrollToSection(href.slice(1));
                          }
                        }
                        // For /blog, let default navigation happen
                      }}
                      className={[
                        "text-base leading-none font-thin py-2 transition-transform duration-200 ease-in-out md:hover:scale-105 md:hover:text-pink-500",
                        "motion-reduce:transform-none motion-reduce:transition-none",
                        isActive ? "text-pink-600" : "text-gray-700",
                      ].join(" ")}
                      style={{ fontFamily: '"Helvetica Neue", "Arial", sans-serif', fontWeight: 200 }}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Desktop call-to-action button */}
            <a
              href="#waitlist"
              aria-label="Join the Waitlist"
              className="hidden md:inline-flex items-center rounded-full border border-pink-300 bg-white/60 shadow-sm px-5 py-2 font-semibold text-base text-pink-700 hover:bg-pink-100 transition-all duration-150 gap-2 ml-auto z-10"
              onClick={e => {
                e.preventDefault();
                scrollToSection('waitlist');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-1 mr-1">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              <span>Join the Waitlist</span>
            </a>

            {/* Hamburger menu button for mobile */}
            <button
              ref={burgerRef}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              data-open={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={["block w-7 h-0.5 mb-1 rounded transition-all", menuOpen ? "bg-pink-500" : "bg-neutral-900", "motion-reduce:transition-none"].join(" ")} />
              <span className={["block w-7 h-0.5 mb-1 rounded transition-all", menuOpen ? "bg-pink-500" : "bg-neutral-900", "motion-reduce:transition-none"].join(" ")} />
              <span className={["block w-7 h-0.5 rounded transition-all", menuOpen ? "bg-pink-500" : "bg-neutral-900", "motion-reduce:transition-none"].join(" ")} />
            </button>
          </div>
        </div>

  {/* Mobile navigation menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            ref={menuRef}
            className="fixed inset-0 bg-white/95 z-40 flex flex-col items-center justify-center md:hidden transition-all overscroll-contain"
            style={{ touchAction: "none" }}
          >
            {/* Mobile brand logo */}
            <a
              href="#home"
              className="flex items-center gap-2 md:gap-3 mb-8"
              onClick={(e) => {
                e.preventDefault();
                setActive(toId('Home'));
                setSection('home');
                setMenuOpen(false);
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
              style={{ outline: 'none' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, width: 44, background: '#fff', borderRadius: '50%', border: '1px solid #eee', marginRight: 8 }}>
                <img
                  src={logoMark}
                  alt="Aangan logo mark"
                  style={{ height: 36, width: 36, display: 'block' }}
                  className="block"
                  width={36}
                  height={36}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                  onError={e => { (e.target as HTMLImageElement).style.background = '#eee'; }}
                />
              </span>
              <img
                src={textLogo}
                alt="Aangan text logo"
                className="h-6 w-auto md:h-8 block shrink-0 relative top-[4px]"
                width={120}
                height={24}
                decoding="async"
                loading="eager"
                fetchPriority="high"
              />
            </a>
            <ul className="space-y-8">
              {navItems.map(({ label, href }, idx) => {
                const id = toId(label);
                const isActive = active === id;
                return (
                  <li key={label} className="flex items-center justify-center">
                    <a
                      href={href}
                      ref={idx === 0 ? firstLinkRef : undefined}
                      aria-current={isActive ? "page" : undefined}
                      onClick={(e) => {
                        if (href.startsWith("#")) {
                          e.preventDefault();
                          setActive(id);
                          // update shared navbar section context
                          if (id === 'home') setSection('home');
                          else if (id === 'community') setSection('community');
                          else if (id === 'pricing') setSection('pricing');

                          setMenuOpen(false);
                          setTimeout(() => {
                            requestAnimationFrame(() => {
                              if (id === 'home') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              } else if (id === 'blog') {
                                scrollToSection('blog-top');
                              } else {
                                scrollToSection(href.slice(1));
                              }
                            });
                          }, 100);
                        } else {
                          setActive(id);
                          setMenuOpen(false);
                        }
                      }}
                      className={[
                        "text-2xl leading-none font-thin min-h-[44px] py-2 transition-transform duration-200 md:hover:scale-105 md:hover:text-pink-500",
                        "motion-reduce:transform-none motion-reduce:transition-none",
                        isActive ? "text-pink-600" : "text-gray-700",
                      ].join(" ")}
                      style={{ fontFamily: '"Helvetica Neue", "Arial", sans-serif', fontWeight: 200 }}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Mobile call-to-action button */}
            <a
              href="#waitlist"
              aria-label="Join the Waitlist"
              style={{ marginLeft: 'auto' }}
              className="md:hidden inline-flex items-center rounded-full border border-pink-300 bg-white/60 shadow-sm px-5 py-2 font-semibold text-base text-pink-700 hover:bg-pink-100 transition-all duration-150 gap-2 h-11 mt-8"
              onClick={e => {
                e.preventDefault();
                setMenuOpen(false);
                setTimeout(() => {
                  requestAnimationFrame(() => scrollToSection('waitlist'));
                }, 100);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-1 mr-1">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              <span>Join the Waitlist</span>
            </a>
          </div>
        )}
  </motion.nav>
    </>
  );
};

export default Navbar;
