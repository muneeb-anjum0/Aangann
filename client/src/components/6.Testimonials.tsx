// Testimonials: User feedback carousel and cards
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import person1 from "../assets/testimonials/person1.jpg";
import person2 from "../assets/testimonials/person2.jpg";
import person3 from "../assets/testimonials/person3.jpg";
import person4 from "../assets/testimonials/person4.jpg";
import person5 from "../assets/testimonials/person5.jpg";
import person6 from "../assets/testimonials/person6.jpg";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
// setSection is provided from App to avoid a separate context file

// Continue the background seamlessly
import backgroundCircle2 from "../assets/missionVision/background-circle2.svg";

// ---------- API base URL ----------
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

// ---- Carousel and layout constants ----
const SPEED_DESKTOP = 40; // px/sec
const SPEED_MOBILE = 28; // px/sec
const VIEWPORT_THRESHOLD = 0.25;
const DESKTOP_CARD_WIDTH = 320; // fixed desktop width
const DESKTOP_CARD_MIN_HEIGHT = 240;
const GAP_PX = 24; // Tailwind gap-6

type Testimonial = {
  id: number;
  rating: number;
  text: string;
  name: string;
  location: string;
  image: string;
};

const testimonialsData: Testimonial[] = [
  { id: 1, rating: 5, text:"I never thought I'd find an app that actually understands the struggles women face every month. The insights and goal reminders feel like they were made just for me. Thank you, Aangan!", name: "Zainab G.", location: "Lahore", image: person1 },
  { id: 2, rating: 5, text:"The doctor chat feature was a lifesaver. I got real answers without the stress of having to leave home. This is the kind of support we need more of.", name: "Fatima A.", location: "Karachi", image: person2 },
  { id: 3, rating: 4, text:"I've struggled with PCOS for years, but Aangan made it easier to understand my irregular spot patterns. The dashboard is clean, and the AI agent actually helped me feel heard.", name: "Meher S.", location: "Karachi", image: person3 },
  { id: 4, rating: 4, text:"Cycle predictions are finally accurate for me. The reminders are gentle, not spammy, and the tone feels culturally respectful. Love the small, thoughtful touches.", name: "Areeba K.", location: "Multan", image: person4 },
  { id: 5, rating: 5, text:"As a working mother, I barely have time for myself. Aangan's period tracking and health reminders have become my personal assistant. It's like having a health coach in my pocket!", name: "Sana M.", location: "Islamabad", image: person5 },
  { id: 6, rating: 4, text:"The symptom tracker helped me identify patterns I never noticed before. Now I can prepare for my period days and manage my energy better. Truly life-changing!", name: "Ayesha R.", location: "Faisalabad", image: person6 },
  { id: 7, rating: 5, text:"I love how the app respects our cultural values while providing modern health solutions. The privacy features give me peace of mind, and the insights are incredibly accurate.", name: "Mariam T.", location: "Peshawar", image: person1 },
];

// ---- UI bits ----
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        clsx("rounded-xl border bg-card text-card-foreground shadow", className)
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={twMerge(clsx("p-6 pt-0", className))} {...props} />
));
CardContent.displayName = "Card";

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
};

const StarRating = React.memo(({ rating }: { rating: number }) => (
  <div className="flex justify-center mb-2" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ))}
  </div>
));
StarRating.displayName = "StarRating";

/* ---------- Match FAQ CTA visuals for internal buttons ---------- */
const ctaClasses = [
  "group relative inline-flex items-center justify-center gap-2.5",
  "px-5 py-2.5 sm:px-6 sm:py-3 rounded-[999px] text-base font-semibold",
  "text-[#5b2a36] select-none overflow-hidden whitespace-nowrap",
  "bg-[#fed5df]/90 backdrop-blur-xl ring-1 ring-white/60",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_24px_rgba(254,213,223,0.60)]",
  "transition-all duration-300 ease-out transform",
  "md:hover:scale-[1.04] hover:-translate-y-[1px] active:translate-y-0",
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_16px_40px_rgba(254,213,223,0.85)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2"
].join(" ");

const GlassLayers = () => (
  <>
    <span
      className="pointer-events-none absolute inset-[1px] rounded-[999px] opacity-80"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.22) 35%, rgba(255,255,255,0.10) 60%, rgba(255,255,255,0.06) 100%)",
      }}
    />
    <span className="pointer-events-none absolute -top-4 left-6 h-10 w-24 rounded-full bg-white/60 blur-2xl opacity-70 transform-gpu transition-transform duration-500 ease-out group-hover:translate-x-6 group-hover:translate-y-1" />
    <span className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-white/30 blur-md opacity-0 group-hover:opacity-70 group-hover:translate-x-[220%] transition-all duration-700 ease-out" />
  </>
);

/* ---------- Modal Utils (match FAQ behavior) ---------- */
const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function trapTabKey(e: React.KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector)
  ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
  if (!elements.length) return;
  const first = elements[0];
  const last = elements[elements.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
}

function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [locked]);
}

/* ---------- Share Your Story Modal (ported to body + topmost z-index) ---------- */
function ShareStoryModal({
  open,
  onClose,
  reduce = false,
}: {
  open: boolean;
  onClose: () => void;
  reduce?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  /* added from t1 */
  const [submitting, setSubmitting] = useState(false);

  useLockBody(open);

  // Prefill from any injected Google/Firebase user object
  useEffect(() => {
    if (!open) return;
    try {
      const w = window as any;
      const u: any =
        w?.__AANGAN_USER ??
        w?.__AUTH_USER ??
        w?.__GOOGLE_USER ??
        w?.__FIREBASE_USER ??
        null;

      if (u) {
        const displayName = u.displayName || u.name || "";
        const photo =
          u.photoURL ||
          u.photoUrl ||
          (typeof u.picture === "string" ? u.picture : u.picture?.data?.url) ||
          "";
        const userCity = u.city || u.location?.city || u.location || "";

        if (photo) setImageUrl(photo);
        setName((prev) => prev || displayName);
        setCity((prev) => prev || userCity);
      }
    } catch {
      /* no-op */
    }
  }, [open]);

  // Focus first field & ESC to close
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 10);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
    const [hover, setHover] = useState<number | null>(null);
    const cur = hover ?? value;
    return (
      <div role="radiogroup" aria-label="Rate from 1 to 5 stars" className="flex items-center gap-1.5">
        {Array.from({ length: 5 }, (_, i) => {
          const n = i + 1;
          const active = n <= cur;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              className="w-7 h-7 rounded-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300/50 transition-transform md:hover:scale-110"
              onFocus={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(n)}
            >
              <span className={active ? "text-yellow-400 text-xl" : "text-gray-300 text-xl"}>★</span>
            </button>
          );
        })}
      </div>
    );
  };

  // --- PORTAL: render overlay into <body> so it sits above all site stacking contexts
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          aria-hidden={!open}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
        >
          {/* Overlay — identical style to FAQ, but topmost */}
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Dialog — same size/animation as FAQ, topmost z */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-story-title"
            ref={dialogRef}
            className={[
              "relative z-[10000] w-[92vw] max-w-xl",
              "rounded-[22px] border border-[#efc7d7]",
              "bg-white",
              "shadow-[0_22px_60px_rgba(155,84,105,0.18)]",
            ].join(" ")}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
            onKeyDown={(e) => {
              if (e.key === "Tab") trapTabKey(e, dialogRef.current);
            }}
          >
            {/* inner glow ring */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[1px] rounded-[20px]"
              style={{
                boxShadow:
                  "inset 0 0 22px rgba(254,222,230,0.45), inset 0 0 44px rgba(254,222,230,0.35), inset 0 0 88px rgba(254,222,230,0.28)",
              }}
            />

            <div className="relative p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <h3
                  id="share-story-title"
                  className="font-['Lexend'] text-black text-[22px] sm:text-[26px] font-semibold leading-tight"
                >
                  Share Your Story
                </h3>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-[#fedee6]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-[#9b5469]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <p className="mt-1 mb-3 font-['Inter'] text-[#2b2b2b] text-sm sm:text-base">
                Tell us how Aangan has helped you. We’ll feature selected stories on our site.
              </p>

              {/* Profile (auto) */}
              <div className="mt-1.5 mb-1 flex items-center gap-4" style={{ minHeight: 56 }}>
                <div className="w-14 h-14 rounded-full overflow-hidden border border-[#efc7d7] bg-white flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" width={56} height={56} />
                  ) : (
                    <span className="text-xs text-[#9b9b9b]">Google photo</span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  ref={firstFieldRef}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex h-10 w-full rounded-2xl border border-[#efc7d7] bg-white px-3.5 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder:text-[#9b5469]/50"
                />
                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex h-10 w-full rounded-2xl border border-[#efc7d7] bg-white px-3.5 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder:text-[#9b5469]/50"
                />
              </div>

              <div className="mt-3">
                <label className="block font-['Lexend'] text-sm text-[#9b5469] mb-1.5">Your review</label>
                <textarea
                  placeholder='Write your review (e.g., "What helped you most?")'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                  className="w-full resize-y rounded-2xl border border-[#efc7d7] bg-white px-4 py-3 font-['Inter'] text-sm sm:text-base text-black placeholder:text-[#9b5469]/50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="mt-3">
                <label className="block font-['Lexend'] text-sm text-[#9b5469] mb-1.5">Your rating</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              {/* Actions (match FAQ layout) */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={twMerge(ctaClasses, "px-5 py-2.5")}
                >
                  <GlassLayers />
                  <span className="relative z-10 font-['Lexend']">Cancel</span>
                </button>

                <button
                  type="button"
                  /* added submitting guard & disabled logic from t1 */
                  disabled={submitting || !name.trim() || !city.trim() || !text.trim() || rating <= 0}
                  onClick={async () => {
                    if (submitting || !name.trim() || !city.trim() || !text.trim() || rating <= 0) return;
                    try {
                      setSubmitting(true);
                      const res = await fetch(`${API_BASE}/api/testimonials`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: name.trim(),
                          city: city.trim(),
                          rating,
                          text: text.trim(),
                        }),
                      });
                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                      // clear fields so next open is clean (as in t1)
                      setName("");
                      setCity("");
                      setText("");
                      setRating(5);
                      onClose();
                    } catch (err) {
                      alert("Failed to send testimonial. Please try again.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className={[
                    ctaClasses,
                    (submitting || !name.trim() || !city.trim() || !text.trim() || rating <= 0)
                      ? "opacity-60 pointer-events-none"
                      : ""
                  ].join(" ")}
                >
                  <GlassLayers />
                  <span className="relative z-10 font-['Lexend']">
                    {submitting ? "Sending…" : "Submit"}
                  </span>
                </button>
              </div>

              <p className="mt-3 text-xs text-[#828282]">
                We’ll use your first name, city, rating, and review if we feature your story.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ---------- Reusable testimonial card ---------- */
const TestimonialCard = React.memo(function TestimonialCard({
  t,
  idx,
  animated,
  variant, // 'desktop' | 'mobile'
}: {
  t: Testimonial;
  idx: number;
  animated?: boolean;
  variant: "desktop" | "mobile";
}) {
  const isDesktop = variant === "desktop";
  const baseHover = "group";

  const widthStyle = isDesktop
    ? { width: `${DESKTOP_CARD_WIDTH}px` }
    : { width: "min(78vw, 420px)" };

  return (
    <motion.div
      className={`${baseHover} flex-shrink-0 will-change-transform`}
      style={widthStyle}
      initial={animated ? { opacity: 0, y: 24, scale: 0.98 } : undefined}
      whileInView={animated ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={animated ? { once: true, amount: 0.2 } : undefined}
      transition={
        animated ? { delay: 0.12 + idx * 0.06, duration: 0.5, ease: "easeOut" } : undefined
      }
    >
      <div className="relative origin-center value-zoom md:hover:-translate-y-1 transition-transform duration-200 will-change-transform">
        <Card
          className={twMerge(
            "relative inner-border-glow-hover bg-white rounded-[22px] md:rounded-[24px] lg:rounded-[26px] border border-[#efc7d7] shadow-none transform-gpu [backface-visibility:hidden] will-change-transform cursor-pointer"
          )}
          style={{
            ...widthStyle,
            minHeight: `${DESKTOP_CARD_MIN_HEIGHT}px`,
            zIndex: 60,
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CardContent className="h-full p-3 md:p-4 flex flex-col justify-between items-center text-center overflow-visible will-change-transform">
            <div>
              <div className="flex-shrink-0">
                <StarRating rating={t.rating} />
              </div>
              <div className="flex items-center justify-center overflow-visible min-h-[60px]">
                <p className="[font-family:'Inter',Helvetica] text-[#212121] text-[13.5px] md:text-sm leading-6 text-center overflow-visible">
                  "{t.text}"
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4 pb-1 w-full">
              <div className="w-10 h-10 rounded-full overflow-visible shadow-md">
                <img
                  src={t.image}
                  alt={`Photo of ${t.name}`}
                  loading="lazy"
                  decoding="async"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <p className="font-semibold text-gray-800 text-sm text-left">
                {t.name} – {t.location}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
});

/* ---------- main component ---------- */
const Testimonials: React.FC<{ setSection: (s: 'home' | 'community' | 'pricing') => void }> = ({ setSection }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSection("community");
        } else {
          setSection("home");
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setSection]);

  const testimonials = useMemo(() => testimonialsData, []);
  const reducedMotion = usePrefersReducedMotion();
  const [modalOpen, setModalOpen] = useState(false);

  // Desktop marquee refs/state
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);
  const reqRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const repeatWidthRef = useRef(0);
  const speedRef = useRef(0);

  // Mobile slider refs/state
  const mobileScrollerRef = useRef<HTMLDivElement>(null);
  const mobileAutoPlayRef = useRef(true);

  // compute fixed repeat width for md+ (cards are fixed width on desktop)
  const computeRepeatWidth = useCallback(() => {
    const n = testimonials.length;
    // width of one set (items + internal gaps) + one seam gap between sets
    const oneSet = n * DESKTOP_CARD_WIDTH + (n - 1) * GAP_PX;
    repeatWidthRef.current = oneSet + GAP_PX; // include seam gap
  }, [testimonials.length]);

  const computeSpeed = useCallback(() => {
    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
    speedRef.current = isMobile ? SPEED_MOBILE : SPEED_DESKTOP;
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTsRef.current = null;
    reqRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (reqRef.current != null) cancelAnimationFrame(reqRef.current);
    reqRef.current = null;
    lastTsRef.current = null;
  }, []);

  const tick = useCallback((ts: number) => {
    if (!runningRef.current) return;
    if (lastTsRef.current == null) {
      lastTsRef.current = ts;
      reqRef.current = requestAnimationFrame(tick);
      return;
    }
    const dt = (ts - lastTsRef.current) / 1000;
    lastTsRef.current = ts;

    const repeatW = repeatWidthRef.current || 0;
    if (repeatW > 0) {
      offsetRef.current -= speedRef.current * dt;
      if (-offsetRef.current >= repeatW) {
        offsetRef.current += repeatW; // seamless loop at exact repeat span
      }
      const track = trackRef.current;
      if (track) {
        track.style.transform = `translate3d(${Math.floor(offsetRef.current)}px,0,0)`;
      }
    }
    reqRef.current = requestAnimationFrame(tick);
  }, []);

  const handlePointerEnter = useCallback(() => !reducedMotion && stop(), [reducedMotion, stop]);
  const handlePointerLeave = useCallback(() => !reducedMotion && start(), [reducedMotion, start]);
  const handleTouchStart = useCallback(() => !reducedMotion && stop(), [reducedMotion, stop]);
  const handleTouchEnd = useCallback(() => !reducedMotion && start(), [reducedMotion, start]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    computeSpeed();
    computeRepeatWidth();

    const onResize = () => {
      computeSpeed();
      computeRepeatWidth();
    };
    window.addEventListener("resize", onResize, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const inView =
          entry.isIntersecting && entry.intersectionRatio >= VIEWPORT_THRESHOLD;
        if (!reducedMotion) {
          if (inView) start();
          else stop();
        }
      },
      { threshold: [VIEWPORT_THRESHOLD] }
    );
    if (wrapperRef.current) io.observe(wrapperRef.current);

    const onVis = () => {
      if (reducedMotion) return;
      if (document.visibilityState === "hidden") stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);

    if (!reducedMotion) start();

    return () => {
      window.removeEventListener("resize", onResize);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [computeRepeatWidth, computeSpeed, reducedMotion, start, stop]);

  // -------- Mobile slider autoplay (sm only) --------
  useEffect(() => {
    const scroller = mobileScrollerRef.current;
    if (!scroller) return;

    let index = 0;
    const getChildren = () => Array.from(scroller.children) as HTMLElement[];

    const toIndex = (i: number) => {
      const items = getChildren();
      if (!items.length) return;
      index = i % items.length;
      const target = items[index];
      scroller.scrollTo({ left: target.offsetLeft - 16, behavior: "smooth" });
    };

    const timer = window.setInterval(() => {
      if (!mobileAutoPlayRef.current) return;
      toIndex(index + 1);
    }, 3500);

    const stopAuto = () => (mobileAutoPlayRef.current = false);
    const startAuto = () => (mobileAutoPlayRef.current = true);

    scroller.addEventListener("touchstart", stopAuto, { passive: true });
    scroller.addEventListener("touchend", startAuto, { passive: true });
    document.addEventListener("visibilitychange", () => {
      mobileAutoPlayRef.current = document.visibilityState === "visible";
    });

    return () => {
      clearInterval(timer);
      scroller.removeEventListener("touchstart", stopAuto as any);
      scroller.removeEventListener("touchend", startAuto as any);
    };
  }, []);

  return (
  <section ref={sectionRef} className="relative w-full bg-[#fdf8f7] pt-12 pb-0 overflow-visible" style={{ zIndex: 2 }}>
      {/* CONTINUATION OF BACKGROUND CIRCLE */}
      <img
        src={backgroundCircle2}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute right-0 -top-[280px] md:-top-[520px] w-[400px] h-[400px] md:w-[640px] md:h-[640px] object-cover z-0 opacity-100"
        loading="eager"
        decoding="async"
        draggable={false}
      />

      {/* Title */}
      <div className="mx-auto max-w-3xl px-2 z-10">
        <motion.h2
          className="font-['Lexend'] text-center mb-10 leading-[1.08] tracking-tight text-black text-3xl md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
        >
          <span className="font-medium">Trusted </span>
          <span className="font-light">by </span>
          <span className="font-medium ml-1">Women </span>
          <span className="font-light">Across </span>
          <span className="font-light">Pakistan</span>
        </motion.h2>
      </div>

      {/* ===== MOBILE: snap slider ===== */}
      <div className="block md:hidden w-full z-10">
        <div
          ref={mobileScrollerRef}
          className="flex justify-center overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-0 touch-pan-x scroll-smooth"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
          }}
        >
          {testimonials.map((t, idx) => (
            <div
              key={`m-${t.id}`}
              className="snap-center flex-shrink-0 mx-auto"
              style={{ width: "min(78vw, 420px)" }}
            >
              <TestimonialCard t={t} idx={idx} animated variant="mobile" />
            </div>
          ))}
        </div>
      </div>

      {/* ===== DESKTOP: seamless marquee ===== */}
      <div
        ref={wrapperRef}
        className="hidden md:block relative z-10 w-full max-w-[98vw] xl:max-w-[1800px] mx-auto overflow-hidden pt-5 pb-0"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ minHeight: DESKTOP_CARD_MIN_HEIGHT + 40 }}
      >
        <div
          ref={trackRef}
          className="flex flex-nowrap gap-6 will-change-transform"
          style={{ transition: "none", minWidth: "100vw" }}
        >
          {[...testimonials, ...testimonials].map((t, idx) => (
            <div key={`d-${idx}-${t.id}`} style={{ width: DESKTOP_CARD_WIDTH }}>
              <TestimonialCard
                t={t}
                idx={idx % testimonials.length}
                animated={idx < testimonials.length} // animate first set only
                variant="desktop"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        className="text-center max-w-7xl mx-auto px-6 md:px-16 z-10 mt-6 md:mt-2"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        <button
          aria-label="Share Your Story"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center rounded-full border border-pink-300 bg-white/60 shadow-sm px-8 py-3 font-semibold text-lg text-pink-700 hover:bg-pink-100 transition-all duration-150 gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-1 mr-1">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <span>Share Your Story</span>
        </button>
      </motion.div>

      {/* Modal mount */}
      <ShareStoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reduce={reducedMotion}
      />
    </section>
  );
};

export default React.memo(Testimonials);
