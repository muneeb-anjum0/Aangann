// FooterSection: Main footer with links and social icons
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import footerBackgroundPattern from "../assets/footer/footer-background-pattern.png";
import aanganLogoMark from "../assets/footer/aangan-logo-mark.svg";
import aanganTextLogo from "../assets/footer/aangan-text-logo.png";
import facebookIcon from "../assets/footer/facebook.png";
import instaIcon from "../assets/footer/insta.png";
import linkedinIcon from "../assets/footer/linkedin.png";

// ----------------------- Static data & utility constants -----------------------
const productLinks = [
  { title: "Features", href: "#" },
  { title: "Community", href: "#" },
  { title: "Blog", href: "#" },
  { title: "Support", href: "#" },
  { title: "Pricing", href: "#" },
  { title: "About us", href: "#" },
  { title: "Contact", href: "#" },
] as const;

const legalLinks = [
  { title: "Terms of Service", href: "#" },
  { title: "Privacy Policy", href: "#" },
  { title: "Blog", href: "#" },
] as const;

const socials = [
  { href: "#", label: "Facebook", icon: facebookIcon },
  { href: "#", label: "Instagram", icon: instaIcon },
  { href: "#", label: "LinkedIn", icon: linkedinIcon },
] as const;

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/* ---------------------------------- UI atoms ---------------------------------- */
const Card = memo(({ children }: { children: ReactNode }) => (
  <div className="bg-white rounded-lg shadow">{children}</div>
));
Card.displayName = "Card";

const CardContent = memo(({ children }: { children: ReactNode }) => (
  <div className="p-4 sm:p-6 md:p-8 lg:p-10">{children}</div>
));
CardContent.displayName = "CardContent";

/* --------------------------------- component --------------------------------- */
const FooterSection = (): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // memoized CSS and bg style to avoid re-creation
  const animCSS = useMemo(
    () => `
      @keyframes fade-in-left {
        0% { opacity: 0; transform: translateX(-32px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes fade-in-right {
        0% { opacity: 0; transform: translateX(32px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(32px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-left { animation: fade-in-left .85s cubic-bezier(0.23,1,0.32,1) forwards; will-change: transform, opacity; }
      .animate-fade-in-right { animation: fade-in-right .85s cubic-bezier(0.23,1,0.32,1) forwards; will-change: transform, opacity; }
      .animate-fade-in-up { animation: fade-in-up .85s cubic-bezier(0.23,1,0.32,1) forwards; will-change: transform, opacity; }

      @media (prefers-reduced-motion: reduce) {
        .animate-fade-in-left,
        .animate-fade-in-right,
        .animate-fade-in-up { animation: none !important; }
      }

      .section-content-visibility { content-visibility: auto; contain-intrinsic-size: 1px 600px; }
    `,
    []
  );

  const bgStyle = useMemo(
    () => ({
      backgroundImage: `url(${footerBackgroundPattern})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
    } as const),
    []
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let stopped = false;
    const options: IntersectionObserverInit = {
      threshold: 0.25,
      rootMargin: "0px 0px -50px 0px",
    };

    const io = new IntersectionObserver(([entry]) => {
      if (!stopped && entry.isIntersecting) {
        setVisible(true);
        stopped = true;
        io.unobserve(entry.target);
        io.disconnect();
      }
    }, options);

    io.observe(el);
    return () => {
      stopped = true;
      io.disconnect();
    };
  }, []);

  const brandBlockClass =
    "flex flex-col gap-3 sm:gap-7 lg:max-w-[680px] w-full " +
    (visible ? "animate-fade-in-up" : "opacity-0");

  const socialsClass =
    "flex items-center justify-center lg:justify-start gap-1 sm:gap-3 " +
    (visible ? "animate-fade-in-left" : "opacity-0");

  // Accordion state for mobile
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // On mobile, nav is accordion, on larger screens keep as before
  const navWrapClass =
    "flex flex-col sm:flex-wrap gap-2 sm:gap-6 lg:gap-12 justify-center lg:justify-end items-center sm:items-start w-full lg:w-auto " +
    (visible ? "animate-fade-in-right" : "opacity-0");

  const copyrightBarClass =
    "w-full h-9 md:h-11 bg-white flex items-center justify-center px-2 sm:px-4 pb-[env(safe-area-inset-bottom)] " +
    (visible ? "animate-fade-in-up" : "opacity-0");

  return (
    <footer role="contentinfo" className="relative w-full">
      <style>{animCSS}</style>

      {/* Decorative background layer (no <img/alt>; not focusable) */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 -z-10 opacity-50 -translate-y-8 sm:translate-y-0"
        style={bgStyle}
      />

      <div ref={ref} className="relative z-10 section-content-visibility">
        <Card>
          <CardContent>
            <div className="max-w-7xl mx-auto px-1 sm:px-4 py-4 sm:py-8 md:py-14">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 sm:gap-8 lg:gap-16">
                {/* Brand + Description */}
                <div className={brandBlockClass}>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <a
                      href="/"
                      aria-label="Aangan home"
                      className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5] rounded"
                    >
                      <img
                        className="h-8 sm:h-9 md:h-10 w-auto"
                        alt=""
                        src={aanganLogoMark}
                        fetchPriority="high"
                        decoding="async"
                        loading="eager"
                        width={40}
                        height={40}
                      />
                      <img
                        className="h-7 sm:h-8 md:h-9 w-auto"
                        alt="Aangan"
                        src={aanganTextLogo}
                        fetchPriority="auto"
                        decoding="async"
                        loading="lazy"
                        width={140}
                        height={36}
                      />
                    </a>
                  </div>

                  <p className="text-[#212121] text-xs sm:text-sm md:text-base text-center lg:text-left">
                    Aangan empowers you to track your cycle with confidence — offering intelligent
                    insights, timely reminders, and personalized health tips. From your first period
                    to every phase that follows, we&apos;re here for you, every step of the way.
                  </p>

                  {/* Socials */}
                  <div className={socialsClass}>
                    {socials.map(({ href, label, icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        className="inline-flex items-center justify-center w-11 h-11 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5]"
                        {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        <img
                          className="w-6 h-6"
                          alt=""
                          src={icon}
                          loading="lazy"
                          decoding="async"
                          width={24}
                          height={24}
                        />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Navigation - accordion for mobile, columns for desktop */}
                <div className={navWrapClass}>
                  {/* Mobile: accordion */}
                  <div className="flex flex-col items-center text-center w-full sm:hidden">
                    {/* Product Accordion */}
                    <button
                      className="w-full flex justify-between items-center py-2 px-3 bg-gray-100 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5] mb-1"
                      onClick={() => setOpenAccordion(openAccordion === 'product' ? null : 'product')}
                      aria-expanded={openAccordion === 'product'}
                      aria-controls="footer-product-links"
                    >
                      <span className="text-base font-medium text-[#212121]">Product</span>
                      <span className={`transition-transform ${openAccordion === 'product' ? 'rotate-90' : ''}`}>▶</span>
                    </button>
                    <nav
                      id="footer-product-links"
                      aria-label="Product"
                      className={`w-full overflow-hidden transition-all duration-300 ${openAccordion === 'product' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <ul className="flex flex-col gap-1 px-4 pb-2">
                        {productLinks.map(({ title, href }) => (
                          <li key={title}>
                            <a
                              href={href}
                              className="block text-sm text-[#212121] hover:text-[#ff9bc5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5] rounded"
                              {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            >
                              {title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    {/* Legal Accordion */}
                    <button
                      className="w-full flex justify-between items-center py-2 px-3 bg-gray-100 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5] mb-1 mt-1"
                      onClick={() => setOpenAccordion(openAccordion === 'legal' ? null : 'legal')}
                      aria-expanded={openAccordion === 'legal'}
                      aria-controls="footer-legal-links"
                    >
                      <span className="text-base font-medium text-[#212121]">Legal</span>
                      <span className={`transition-transform ${openAccordion === 'legal' ? 'rotate-90' : ''}`}>▶</span>
                    </button>
                    <nav
                      id="footer-legal-links"
                      aria-label="Legal"
                      className={`w-full overflow-hidden transition-all duration-300 ${openAccordion === 'legal' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <ul className="flex flex-col gap-1 px-4 pb-2">
                        {legalLinks.map(({ title, href }) => (
                          <li key={title}>
                            <a
                              href={href}
                              className="block text-sm text-[#212121] hover:text-[#ff9bc5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5] rounded"
                              {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            >
                              {title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                  {/* Desktop: as before, two columns */}
                  <div className="hidden sm:flex flex-row gap-8 w-full sm:w-auto">
                    <div className="flex flex-col items-center text-center lg:items-end lg:text-right flex-1 max-w-[260px]">
                      <h3 className="text-base sm:text-lg font-medium text-[#212121]">Product</h3>
                      <nav aria-label="Product">
                        <ul className="flex flex-col gap-1">
                          {productLinks.map(({ title, href }) => (
                            <li key={title}>
                              <a
                                href={href}
                                className="text-sm text-[#212121] hover:text-[#ff9bc5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5] rounded"
                                {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              >
                                {title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                    <div className="flex flex-col items-center text-center lg:items-end lg:text-right flex-1 max-w-[260px]">
                      <h3 className="text-base sm:text-lg font-medium text-[#212121]">Legal</h3>
                      <nav aria-label="Legal">
                        <ul className="flex flex-col gap-1">
                          {legalLinks.map(({ title, href }) => (
                            <li key={title}>
                              <a
                                href={href}
                                className="text-sm text-[#212121] hover:text-[#ff9bc5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9bc5] rounded"
                                {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              >
                                {title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copyright bar */}
        <div className={copyrightBarClass}>
          <p className="text-[#000000] text-xs md:text-sm text-center">© 2025 Aangan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default memo(FooterSection);
