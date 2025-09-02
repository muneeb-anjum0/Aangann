// Pricing: Subscription plans and features
import { CheckIcon, XIcon } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import bgLeft from "../assets/missionVision/background-circle.svg";
import bgRight from "../assets/missionVision/background-circle2.svg";

type Feature = { text: string; included: boolean; singleLine: boolean };
type Plan = {
  name: string;
  price: string;
  description: string;
  features: Feature[];
  buttonText: string;
};

const PLAN_DATA: Readonly<Plan[]> = [
  {
    name: "Free",
    price: "Rs. 0",
    description: "Log, Learn, and Explore – at no cost.",
    features: [
      { text: "Track your periods, moods, and symptoms", included: true, singleLine: true },
      { text: "Get personalized desi totkay & health insights", included: true, singleLine: false },
      { text: "Browse community threads for shared wisdom", included: true, singleLine: false },
      { text: "No posting, replies, or community support", included: false, singleLine: true },
    ],
    buttonText: "Get Started for Free",
  },
  {
    name: "Community",
    price: "Rs. 750",
    description: "All from Free, plus your voice in the mix",
    features: [
      { text: "Post your own threads and questions", included: true, singleLine: true },
      { text: "Reply and connect with others in the community", included: true, singleLine: false },
      { text: "Dive deeper into shared stories and support", included: true, singleLine: false },
      { text: "No doctor bookings or expert care", included: false, singleLine: true },
    ],
    buttonText: "Get Started with Community",
  },
  {
    name: "Care",
    price: "Rs. 1000",
    description: "Community plus expert care & your space",
    features: [
      { text: "Book appointments with trusted doctors", included: true, singleLine: true },
      { text: "Start your own private or public community", included: true, singleLine: false },
      { text: "Ongoing support for PCOS, hormonal health, and more", included: true, singleLine: false },
      { text: "Holistic care: from totkay to telehealth, all in one app", included: true, singleLine: false },
    ],
    buttonText: "Get Started with Care",
  },
] as const;

// Liquid Glass CTA
const ctaClasses = [
  "inline-flex items-center rounded-full border border-pink-300 bg-white/60 shadow-sm px-5 py-3 font-semibold text-base text-pink-700 hover:bg-pink-100 transition-all duration-150 gap-2",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2"
].join(" ");



// iOS-like Liquid Glass Toggle (compact on mobile)
const IOSGlassToggle: React.FC<{
  value: "monthly" | "yearly";
  onChange: (v: "monthly" | "yearly") => void;
  compact?: boolean;
}> = ({ value, onChange, compact = false }) => {
  const isYearly = value === "yearly";
  const trackW = compact ? 160 : 180;
  const trackH = compact ? 48 : 56;
  const knobW = compact ? 76 : 88;
  const knobH = compact ? 40 : 48;
  const translateX = trackW - knobW - 8;

  return (
    <button
      role="switch"
      aria-checked={isYearly}
      onClick={() => onChange(isYearly ? "monthly" : "yearly")}
      className="inline-flex items-center rounded-full border border-pink-300 bg-white/60 shadow-sm px-8 py-3 font-semibold text-lg text-pink-700 hover:bg-pink-100 transition-all duration-150 gap-3"
      style={{ width: trackW, height: trackH }}
    >
  {/* Track sheen */}
      <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
        <span
          className="absolute inset-[1px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.28) 40%, rgba(255,255,255,0.12) 100%)",
          }}
        />
        <span className="absolute -top-3 left-8 h-10 w-28 bg-white/60 blur-2xl rounded-full" />
      </span>

  {/* Labels above knob */}
      <span
        className="absolute inset-0 z-10 pointer-events-none flex items-center justify-between px-5 font-semibold tracking-wide"
        style={{ fontSize: compact ? 15 : 16 }}
      >
        <span className={isYearly ? "text-[#5b2a36]/85" : "text-[#5b2a36]"}>Monthly</span>
        <span className={!isYearly ? "text-[#5b2a36]/85" : "text-[#5b2a36]"}>Yearly</span>
      </span>

  {/* Knob */}
      <span
        className="absolute top-1 left-1 rounded-full z-0 overflow-hidden border border-pink-300 bg-white/70 shadow-lg transition-transform duration-300 ease-out transform-gpu"
        style={{
          width: knobW,
          height: knobH,
          transform: isYearly ? `translateX(${translateX}px)` : "translateX(0px)",
        }}
      >
        {/* Glassy background */}
        <span className="absolute inset-0 bg-white/70" />
        {/* Soft highlight */}
        <span className="absolute top-0 left-0 w-full h-1 rounded-t-full bg-white/60 opacity-60" />
        {/* Radial shadow */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 35%, rgba(253,221,229,0.18) 0%, rgba(255,255,255,0.00) 55%)",
          }}
        />
        {/* Inner glass gradient */}
        <span
          className="pointer-events-none absolute inset-[1px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.22) 35%, rgba(255,255,255,0.10) 100%)",
          }}
        />
      </span>
    </button>
  );
};

// Feature Row (wrapping text; no overflow)
const FeatureRow = React.memo(function FeatureRow({ f }: { f: Feature }) {
  return (
    <div className="flex items-start gap-2 pr-1.5 w-full">
      {f.included ? (
        <CheckIcon className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-green-500 flex-shrink-0 mt-[2px]" />
      ) : (
        <XIcon className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-red-500 flex-shrink-0 mt-[2px]" />
      )}
      <div className="mt-[-1px] font-['Inter'] text-black text-[14px] md:text-[15px] leading-6 break-words">
        {f.text}
      </div>
    </div>
  );
});

/* ========= Plan Card ========= */
const PlanCard = React.memo(function PlanCard({
  plan,
  index,
  visible,
  fillParent = false,
  billingPeriod,
  // isMobile, // removed unused prop
}: {
  plan: Plan;
  index: number;
  visible: boolean;
  fillParent?: boolean;
  billingPeriod: "monthly" | "yearly";
  // isMobile: boolean; // removed unused prop
}) {
  const sizeClasses = fillParent ? "w-full h-full" : "w-[340px] md:w-[360px] h-[500px]";
  // remove static pink drop-shadow (keep only subtle top inset)
  const baseShadow = "inset 0 1px 0 rgba(255,255,255,0.9)";

  return (
    <div
      className={[
        sizeClasses,
  "relative group inner-border-glow-hover bg-white rounded-[22px] md:rounded-[24px] lg:rounded-[26px] value-zoom border border-[#efc7d7] static-card-shadow",
        "transition-transform duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        "will-change-transform transform-gpu"
      ].join(" ")}
      style={{ transitionDelay: `${index * 120}ms`, boxShadow: baseShadow, borderColor: '#efc7d7' }}
    >
  {/* Hover inner glow handled by `inner-border-glow-hover` (from MissionVision inline CSS) */}

      {/* ambient blobs only on md+ to avoid artifacts */}
  <div className="hidden md:block absolute -top-4 -right-4 h-16 w-16 rounded-full bg-[#ffd6e8] blur-2xl opacity-60 z-0" />
  <div className="hidden md:block absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-[#ffe7f2] blur-3xl opacity-70 z-0" />

      {/* content (extra padding; clamp widths so nothing spills) */}
      <div className="relative z-10 flex h-full w-full flex-col gap-3 px-5 sm:px-7 md:px-8 pt-6 pb-6">
        <div className="flex flex-col gap-1.5 pr-1">
          <h2 className="font-['Lexend'] font-semibold text-[#212121] text-[22px] sm:text-[24px] md:text-[26px]">
            {plan.name}
          </h2>
          <div className="text-[13px] sm:text-sm md:text-[15px] text-[#9b5469] font-semibold tracking-wide">
            {billingPeriod === "monthly" ? "Billed monthly" : "Billed yearly"}
          </div>
        </div>

        <p className="font-['Inter'] text-[#353535b2] text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] pr-1 break-words">
          {plan.description}
        </p>

        <div className="flex w-full flex-col gap-2.5 sm:gap-3 mt-1">
          {plan.features.map((f, i) => (
            <FeatureRow key={i} f={f} />
          ))}
        </div>

        <div className="mt-auto flex items-center justify-center pt-4">
          <button
            type="button"
            aria-label={plan.buttonText}
            className={`${ctaClasses} max-w-[94%] sm:max-w-none`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-1 mr-1">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>{plan.buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

/* ========= Mobile Deck ========= */
const PricingDeck: React.FC<{
  plans: readonly Plan[];
  visible: boolean;
  billingPeriod: "monthly" | "yearly";
}> = ({ plans, visible, billingPeriod }) => {
  const [order, setOrder] = useState<number[]>(() => plans.map((_, i) => i));
  const [animating, setAnimating] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const finishAdvance = React.useCallback(() => {
    setOrder((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
    setActiveCard(null);
    setAnimating(false);
  }, []);

  const onAdvance = React.useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setActiveCard(order[0]);
  }, [animating, order]);

  // Responsive: use window width to determine mobile/desktop
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const cardW = isMobile ? 300 : 340;
  const cardH = isMobile ? 480 : 500;
  const offsetX = isMobile ? 10 : 12;
  const scaleStep = 0.045;

  return (
    <div className="w-full flex justify-center items-center">
      <div
        className={`relative mx-auto transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{
          width: cardW + (order.length - 1) * offsetX,
          height: cardH,
          perspective: "900px",
          transformStyle: "preserve-3d",
        }}
      >
        {order.map((planIndex, i) => {
          const pos = i;
          const z = order.length - i;
          const baseX = pos * offsetX;
          const baseScale = 1 - pos * scaleStep;
          const isActive = activeCard === planIndex;
          const isAnimating = animating;
          const newPos = Math.max(0, pos - 1);
          const shiftX = newPos * offsetX;
          const shiftScale = 1 - newPos * scaleStep;

          const transform = isAnimating
            ? isActive
              ? "translateZ(-240px) translateY(2px) rotateY(-2deg) scale(0.94)"
              : `translateX(${shiftX}px) scale(${shiftScale})`
            : `translateX(${baseX}px) scale(${baseScale})`;

          const transition = isAnimating
            ? isActive
              ? "transform 600ms cubic-bezier(0.4,0.2,0.2,1), opacity 400ms cubic-bezier(0.4,0.2,0.2,1)"
              : "transform 420ms cubic-bezier(0.4,0.2,0.2,1)"
            : "transform 320ms cubic-bezier(0.4,0.2,0.2,1), opacity 320ms cubic-bezier(0.4,0.2,0.2,1)";

          const opacity = isAnimating && isActive ? 0.92 : 1;

          const handleTransitionEnd: React.TransitionEventHandler<HTMLDivElement> = (e) => {
            if (!isActive) return;
            if (e.propertyName !== "transform") return;
            finishAdvance();
          };

          return (
            <div
              key={`pricing-deck-card-${planIndex}`}
              className="absolute top-0 will-change-transform"
              style={{
                transform,
                zIndex: isAnimating && isActive ? 0 : z,
                transition,
                opacity,
                pointerEvents: (!isAnimating && pos === 0) ? "auto" : "none",
                width: cardW,
                height: cardH,
              }}
              onTransitionEnd={handleTransitionEnd}
              onClick={onAdvance}
              role="button"
              tabIndex={pos === 0 ? 0 : -1}
              onKeyDown={(e) => {
                if (pos === 0 && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onAdvance();
                }
              }}
            >
              <PlanCard
                plan={plans[planIndex]}
                index={planIndex}
                visible={true}
                fillParent
                billingPeriod={billingPeriod}
                // isMobile prop removed
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ========= Main Pricing ========= */
const Pricing: React.FC<{ setSection: (s: 'home' | 'community' | 'pricing') => void }> = ({ setSection }) => {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSection("pricing");
        else setSection("home");
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setSection]);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [areCardsVisible, setAreCardsVisible] = useState(false);
  const [areExtrasVisible, setAreExtrasVisible] = useState(false);
  const extrasRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  const raf = requestAnimationFrame(() => setAreCardsVisible(true));
    const headerT = setTimeout(() => setIsHeaderVisible(true), 300);
    const cardsT = setTimeout(() => setAreCardsVisible(true), 900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(headerT);
      clearTimeout(cardsT);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setAreExtrasVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (extrasRef.current) observer.observe(extrasRef.current);
    return () => observer.disconnect();
  }, []);

  const plans = useMemo(() => PLAN_DATA, []);
  const isMobile = viewportW <= 768;

  return (
  // CHANGED: overflow-visible so images can bleed outside this section
  <main ref={sectionRef} className="relative flex w-full flex-col items-center overflow-visible bg-[#fdf8f7]">
      {/* decorations */}
      <img
        src={bgLeft}
        alt=""
        className="pointer-events-none absolute left-0 top-0 z-0 w-[540px] select-none opacity-90 md:w-[700px]"
        style={{ transform: "translateY(-31%) translateX(0%)", maxWidth: "120vw", willChange: "transform, opacity" }}
        aria-hidden={true}
        loading="eager"
        decoding="async"
      />
      <img
        src={bgRight}
        alt=""
        className="pointer-events-none absolute right-0 top-0 z-0 w-[540px] select-none opacity-90 md:w-[700px]"
        style={{ transform: "translateY(-31%) translateX(0%)", maxWidth: "120vw", willChange: "transform, opacity" }}
        aria-hidden={true}
        loading="eager"
        decoding="async"
      />

      <div
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <img
          src={bgLeft}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute left-0 top-[-10%] select-none h-[150%] max-w-none object-contain md:h-[170%]"
          style={{ willChange: "opacity, transform" }}
        />
        <img
          src={bgRight}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute right-0 top-[-10%] select-none h-[150%] max-w-none object-contain md:h-[170%]"
          style={{ willChange: "opacity, transform" }}
        />
      </div>

      {/* content */}
      <div className="relative z-10 flex w-full flex-col">
        <section className="relative flex w-full flex-col items-center gap-4 px-4 md:px-0 pt-20 pb-16">
          <div className="relative mt-0 flex w-full flex-col items-center gap-6">
            <div
              className={`relative flex w-full flex-col items-center gap-[12px] transform-gpu transition-all duration-[900ms] ease-out ${
                isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ willChange: "transform, opacity" }}
            >
              <h1 className="font-['Lexend'] font-light text-black text-[34px] sm:text-[36px] md:text-[38px] text-center">
                Find the Right Fit for Your Flow
              </h1>
              <p className="max-w-[820px] font-['Inter'] text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] text-center text-[#353535cc]">
                Whether you're just starting out or looking for deeper support, we've got a plan for you.
                Start free, stay connected, and upgrade when you're ready.
              </p>
            </div>

            {/* iOS Liquid Glass Toggle (compact on mobile) */}
            <div
              className={`transform-gpu transition-all duration-[900ms] ease-out ${
                isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ willChange: "transform, opacity" }}
            >
              <IOSGlassToggle value={billingPeriod} onChange={setBillingPeriod} compact={isMobile} />
            </div>
          </div>

          {/* cards */}
          {isMobile ? (
            <div className="relative mt-0 mb-0 w-full flex justify-center">
              <PricingDeck
                plans={plans}
                visible={areCardsVisible}
                billingPeriod={billingPeriod}
                // isMobile prop removed
              />
            </div>
          ) : (
            <div className="relative mt-2 mb-0 inline-flex flex-wrap items-center justify-center gap-6 md:gap-7">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.name}
                  plan={plan}
                  index={index}
                  visible={areCardsVisible}
                  billingPeriod={billingPeriod}
                  // isMobile prop removed
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* spacer that adds no height */}
      <div
        ref={extrasRef}
        className={`w-full h-0 transition-opacity duration-[1000ms] ease-out ${
          areExtrasVisible ? "opacity-100" : "opacity-0"
        }`}
      />
    </main>
  );
};

export default Pricing;
