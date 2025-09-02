// Mission & Vision: Cards and values for Aangan's mission section
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { JSX, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// ---------- Utility functions ----------
function cn(...inputs: Array<string | number | false | null | undefined>) {
  return twMerge(clsx(inputs));
}
const useRafEvent = (handler: () => void) => {
  const frame = useRef<number | null>(null);
  return useCallback(() => {
    if (frame.current != null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      handler();
    });
  }, [handler]);
};

// ---------- Card shell components ----------
const Card = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground", className)} {...props} />
  )
);
Card.displayName = "Card";
const CardContent = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

// ---------- Asset imports ----------
import backgroundCircle from "../assets/missionVision/background-circle.svg";
import backgroundCircle2 from "../assets/missionVision/background-circle2.svg";
import backgroundDecor from "../assets/missionVision/background-decor.svg";
import muslimWomenCafe from "../assets/missionVision/img8.svg";
import happyBirds2 from "../assets/missionVision/img1.svg";
import happyBirds5 from "../assets/missionVision/img2.svg";
import happyBirds6 from "../assets/missionVision/img3.svg";
import happyBirds8 from "../assets/missionVision/img4.svg";
import happyBirds9 from "../assets/missionVision/img5.svg";
import happyBirds10 from "../assets/missionVision/img6.svg";
import happyBirds11 from "../assets/missionVision/img7.svg";
import decorativePencilLine from "../assets/decorative-pencil-line.svg";

// ---------- Inline CSS for custom styles ----------
const INLINE_STYLE = `
.static-card-shadow{
  box-shadow: 0 2px 8px rgba(0,0,0,.05), 0 8px 18px rgba(0,0,0,.06);
  border: 1px solid rgba(0,0,0,.05);
}
.inner-border-glow{position:relative;background:#fff}
.inner-border-glow::after{
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  box-shadow:
    inset 0 0 0 1.5px rgba(247,105,145,.48),
    inset 0 0 14px 6px rgba(247,105,145,.10),
    inset 0 0 30px 14px rgba(247,105,145,.05);
}
.inner-border-glow-hover{position:relative;background:#fff}
.inner-border-glow-hover::after{
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0;
  transition:opacity 160ms ease;
  box-shadow:
    inset 0 0 0 1.5px rgba(247,105,145,.48),
    inset 0 0 14px 6px rgba(247,105,145,.10),
    inset 0 0 30px 14px rgba(247,105,145,.05);
}
@media(hover:hover){
  .inner-border-glow-hover:hover::after,
  .inner-border-glow-hover:focus-visible::after{opacity:1}
}
.value-zoom{transform:translateZ(0) scale(1);transition:transform 240ms cubic-bezier(.2,.6,.2,1);will-change:transform}
@media(hover:hover){.value-zoom:hover,.value-zoom:focus-visible{transform:translateZ(0) scale(1.04)}}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
.flow-in{opacity:0;transform:translateY(8px) scale(.99)}
[data-inview="true"] .flow-in{animation:fadeSlideIn .28s cubic-bezier(.2,.6,.2,1) forwards}
.deck-wrap{
  position:relative;
  contain:paint;
  touch-action:manipulation;
  overflow:visible;
  box-shadow:none !important;
  background:transparent !important;
}
.deck-card{
  position:absolute; top:0; left:0;
  will-change:transform;
  transition: transform 360ms cubic-bezier(.3,.7,.2,1), opacity 200ms ease;
}
.deck-card .card{border-radius:22px}
.deck-card.is-active.shuffling-out{
  transition: transform 420ms cubic-bezier(.35,.7,.1,1), opacity 200ms ease;
}
@media (prefers-reduced-motion: reduce){
  .value-zoom{transition:none}
  .deck-card{transition:none}
}
img{ -webkit-user-drag: none; user-select:none; }
`;

// ---------- Mission and values card data ----------
const missionCards = [
  { title: "Normalize the Conversation", image: muslimWomenCafe, bgColor: "bg-[#fa9b9b80]", borderColor: "border-[#fa9b9b]" },
  { title: "Bridge the Awareness Gap", image: happyBirds2, bgColor: "bg-[#fabf7680]", borderColor: "border-[#fabf76]" },
  { title: "Champion Desi Care", image: happyBirds5, bgColor: "bg-[#dbbfac80]", borderColor: "border-[#dbbfac]" },
  { title: "Knowledge is Self-Care", image: happyBirds6, bgColor: "bg-[#f2c5b280]", borderColor: "border-[#f2c5b2]" },
  { title: "Break Silence, Build Support", image: happyBirds8, bgColor: "bg-[#ff72ad4c]", borderColor: "border-[#ff72ad]" },
  { title: "Uplift with Empathy", image: happyBirds9, bgColor: "bg-[#d799de4f]", borderColor: "border-[#d799de]" },
  { title: "Dignity in Every Phase", image: happyBirds10, bgColor: "bg-[#f0ab6b80]", borderColor: "border-[#f0ab6b]" },
  { title: "Heal through Community", image: happyBirds11, bgColor: "bg-[#7fc1e380]", borderColor: "border-[#7fc1e3]" },
] as const;

const valuesCards = [
  { title: "Awareness\nThrough Knowledge", description: "We combine modern technology, cultural wisdom, and trusted medical expertise to empower women with health information that's accurate, accessible, and truly relevant to their daily lives and unique needs." },
  { title: "Data Protection", description: "Confidentiality is non-negotiable. Any private or sensitive information you share is treated with the utmost care; never reused, never repurposed, and never shared outside of Aangan." },
  { title: "Consent First", description: "We prioritize your comfort, safety, and privacy. Every interaction and contribution is built on formal consent giving you complete control over your data and choices." },
  { title: "Cultural Integrity", description: 'We honor our roots by asking, "Will Phopho approve?"keeping everything modest, halal, and respectful.' },
  { title: "Kindness &\nTransparency", description: "Direct, respectful, empathetic feedback no gossip; real-time, solution-focused communication." },
] as const;

/* ---------- mobile layout ---------- */
type Pos = { index: number; left: number; top: number; scale?: number };
const mobileLayout = {
  cardWidth: 120, cardHeight: 150, canvasTopHeight: 320, canvasBottomHeight: 320,
  top:  [ { index: 6, left: 74,  top: 16,  scale: .72 }, { index: 0, left: 172, top: -1,  scale: .72 }, { index: 7, left: 74,  top: 132, scale: .72 }, { index: 3, left: 172, top: 116, scale: .72 } ] as Pos[],
  bottom:[ { index: 4, left: 74,  top: 16,  scale: .72 }, { index: 1, left: 172, top: -1,  scale: .72 }, { index: 5, left: 74,  top: 132, scale: .72 }, { index: 2, left: 172, top: 116, scale: .72 } ] as Pos[],
} as const;

const getCardSize = (w: number) =>
  (w <= 768 ? { width: 90, height: 118 } : w <= 1024 ? { width: 112, height: 148 } : { width: 140, height: 186 });

/* ---------- MissionCard ---------- */
const MissionCard = React.memo(function MissionCard({
  cardData, size, wrapperStyle, viewportWidth, flowDelay = 0, hover = true,
}: {
  cardData: typeof missionCards[number];
  size?: { width: number; height: number };
  wrapperStyle?: React.CSSProperties;
  viewportWidth: number;
  flowDelay?: number;
  hover?: boolean;
}) {
  const isMobile = viewportWidth <= 768;
  const sz = size ?? getCardSize(viewportWidth);
  const { padding, br, imageSize, textH } = useMemo(() => {
    const pad = Math.max(4, Math.round(sz.width * 0.04));
    const br = Math.round(sz.width * 0.1);
    const baseImage = Math.round(sz.width * (isMobile ? 0.58 : 0.76)) + (isMobile ? 2 : 8);
    const textH = Math.round(sz.height * (isMobile ? 0.42 : 0.28));
    return { padding: pad, br, imageSize: baseImage, textH };
  }, [isMobile, sz.height, sz.width]);

  return (
    <div className={cn(hover && "md:hover:scale-[1.04]")} style={wrapperStyle}>
      <Card
        className={`${cardData.bgColor} border ${cardData.borderColor} flow-in static-card-shadow`}
        style={{ width: sz.width, height: sz.height, borderRadius: br, animationDelay: `${flowDelay}ms` as any, contain: "paint" }}
      >
        <CardContent className="h-full flex flex-col justify-between items-center p-0" style={{ padding }}>
          <div className="flex items-center justify-center flex-1">
            <img alt="" src={cardData.image} loading="lazy" decoding="async" fetchPriority="low" className="object-contain"
                 style={{ width: imageSize, height: imageSize, maxWidth: "100%", maxHeight: "100%" }}/>
          </div>
          <div className="flex items-center justify-center text-center w-full px-1" style={{ height: textH }}>
            <span className="text-black font-normal text-center whitespace-pre-line break-words"
              style={{ lineHeight: 1.15, fontSize: isMobile ? "0.62rem" : "0.76rem", display: "-webkit-box",
                       WebkitLineClamp: isMobile ? 3 : 2, WebkitBoxOrient: "vertical", overflow: "visible" }}>
              {cardData.title}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

/* ---------- ValuesDeck (MOBILE) ---------- */
function ValuesDeck({ visible, viewportW, viewportH }: { visible: boolean; viewportW: number; viewportH: number }) {
  // Carousel state: show center card, with prev/next partially visible
  const [activeIdx, setActiveIdx] = useState(0);
  const cardCount = valuesCards.length;
  const deckWidth = useMemo(() => Math.min(280, Math.max(220, Math.round(viewportW - 48))), [viewportW]);
  const deckHeight = useMemo(() => Math.min(340, Math.max(260, Math.round(Math.min(viewportH * 0.42, viewportW * 0.85)))), [viewportH, viewportW]);

  // Carousel navigation
  const goNext = useCallback(() => setActiveIdx((i) => (i + 1) % cardCount), [cardCount]);

  // For swipe gesture (optional, can be extended)
  // ...existing code...

  // Carousel layout: center, left, right
  const getCardProps = (i: number) => {
    const pos = i - activeIdx;
    if (pos === 0) {
      // Center card
      return {
        style: {
          zIndex: 3,
          transform: 'translateX(0) scale(1)',
          opacity: 1,
          boxShadow: '0 6px 32px 0 rgba(247,105,145,0.13)',
          transition: 'transform 0.35s cubic-bezier(.4,.7,.2,1), opacity 0.25s',
        },
        className: 'deck-card deck-card-center',
        tabIndex: 0,
        'aria-current': true,
      };
    } else if (pos === -1 || (activeIdx === 0 && i === cardCount - 1)) {
      // Left card
      return {
        style: {
          zIndex: 2,
          transform: 'translateX(-60%) scale(0.88)',
          opacity: 0.6,
          filter: 'blur(1.5px)',
          transition: 'transform 0.35s cubic-bezier(.4,.7,.2,1), opacity 0.25s',
        },
        className: 'deck-card deck-card-left',
        tabIndex: -1,
      };
    } else if (pos === 1 || (activeIdx === cardCount - 1 && i === 0)) {
      // Right card
      return {
        style: {
          zIndex: 2,
          transform: 'translateX(60%) scale(0.88)',
          opacity: 0.6,
          filter: 'blur(1.5px)',
          transition: 'transform 0.35s cubic-bezier(.4,.7,.2,1), opacity 0.25s',
        },
        className: 'deck-card deck-card-right',
        tabIndex: -1,
      };
    } else {
      // Hidden cards
      return {
        style: { zIndex: 1, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' as any },
        className: 'deck-card deck-card-hidden',
        tabIndex: -1,
      };
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div
        className={`deck-wrap mx-auto relative ${visible ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
        style={{ width: deckWidth, height: deckHeight }}
      >
        {valuesCards.map((card, i) => {
          const cardProps = getCardProps(i);
          return (
            <div
              key={`values-deck-card-${i}`}
              {...cardProps}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: deckWidth,
                height: deckHeight,
                ...cardProps.style,
              }}
            >
              <button
                type="button"
                aria-label="Show next value"
                onClick={goNext}
                className="block w-full h-full outline-none rounded-[22px]"
                style={{ WebkitTapHighlightColor: "transparent", background: 'none', border: 'none', padding: 0 }}
                tabIndex={cardProps.tabIndex}
              >
                <Card
                  className={`border border-[#efc7d7] ${cardProps.className} ${cardProps['aria-current'] ? 'inner-border-glow' : ''}`}
                  style={{
                    width: deckWidth,
                    height: deckHeight,
                    background: "#fff",
                    borderRadius: 22,
                  }}
                >
                  <CardContent className="h-full p-4 flex flex-col justify-between items-center text-center">
                    <div className="flex-shrink-0">
                      <h3 className="font-['Lexend'] text-[#212121] leading-tight whitespace-pre-line mb-2"
                          style={{ fontSize: 20 }}>
                        {card.title}
                      </h3>
                      <img
                        src={decorativePencilLine}
                        alt="decorative pencil line"
                        className="mx-auto my-2"
                        style={{ maxWidth: 120, width: "100%", height: "auto" }}
                        draggable={false}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <p
                        className="[font-family:'Inter',Helvetica] text-[#212121] text-center"
                        style={{
                          fontSize: 15,
                          lineHeight: "1.6",
                          display: "-webkit-box",
                          WebkitLineClamp: 9,
                          WebkitBoxOrient: "vertical",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </div>
          );
        })}
      </div>
      {/* Progress indicator dots */}
      <div className="flex justify-center items-center gap-2 mt-3">
        {valuesCards.map((_, i) => (
          <span
            key={`dot-${i}`}
            className={`inline-block rounded-full transition-all duration-200 ${i === activeIdx ? 'bg-[#f76991] w-3 h-3' : 'bg-[#efc7d7] w-2 h-2'}`}
            style={{ opacity: i === activeIdx ? 1 : 0.6 }}
          />
        ))}
      </div>
  {/* Arrows removed as requested */}
    </div>
  );
}

/* ---------- component ---------- */

export default function MissionVision(): JSX.Element {
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  // --- Desktop/Tablet scaling logic ---
  const BASE_DESKTOP_WIDTH = 1920;
  const MIN_SCALE = 0.5;
  const [desktopScale, setDesktopScale] = useState(1);

  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  const [missionInView, setMissionInView] = useState(false);
  const [valuesInView, setValuesInView] = useState(false);

  /* add styles once */
  useEffect(() => {
    const id = "aangan-inline-anim-style";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = INLINE_STYLE;
      document.head.appendChild(s);
    }
  }, []);

  /* throttle resize */
  const onResizeRaf = useRafEvent(() => {
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    // Update desktop/tablet scale
    if (window.innerWidth > 1024) {
      setDesktopScale(Math.max(MIN_SCALE, window.innerWidth / BASE_DESKTOP_WIDTH));
    } else if (window.innerWidth > 768) {
      setDesktopScale(Math.max(MIN_SCALE, window.innerWidth / 1280)); // For tablets, use 1280 as base
    } else {
      setDesktopScale(1);
    }
  });
  useEffect(() => {
    window.addEventListener("resize", onResizeRaf, { passive: true });
    // Set initial scale
    if (typeof window !== "undefined") {
      if (window.innerWidth > 1024) {
        setDesktopScale(Math.max(MIN_SCALE, window.innerWidth / BASE_DESKTOP_WIDTH));
      } else if (window.innerWidth > 768) {
        setDesktopScale(Math.max(MIN_SCALE, window.innerWidth / 1280));
      } else {
        setDesktopScale(1);
      }
    }
    return () => window.removeEventListener("resize", onResizeRaf as unknown as EventListener);
  }, [onResizeRaf]);

  // Use Intersection Observer for in-view detection (better for mobile)
  useEffect(() => {
    const el1 = missionRef.current;
    const el2 = valuesRef.current;
    if (!el1 || !el2) return;

    let missionObserved = false;
    let valuesObserved = false;

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === el1 && entry.isIntersecting && !missionObserved) {
            setMissionInView(true);
            missionObserved = true;
          }
          if (entry.target === el2 && entry.isIntersecting && !valuesObserved) {
            setValuesInView(true);
            valuesObserved = true;
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el1);
    observer.observe(el2);
    return () => {
      observer.disconnect();
    };
  }, []);

  /* preload images */
  useEffect(() => {
    const srcs = new Set<string>([
      backgroundDecor, backgroundCircle, backgroundCircle2,
      ...missionCards.map((c) => c.image),
    ]);
    srcs.forEach((s) => { const link = document.createElement("link"); link.rel = "preload"; link.as = "image"; link.href = s; document.head.appendChild(link); });
    (async () => {
      await Promise.all([...srcs].map(async (s) => {
        try { const img = new Image(); img.decoding = "async"; img.src = s; if (img.decode) await img.decode(); } catch {}
      }));
    })();
  }, []);

  /* precompute mission mobile clusters */
  const mobileTopCards = useMemo(
    () => (Array.isArray(mobileLayout.top) ? mobileLayout.top : []).map((p, i) => ({
      key: `m-top-${p.index}`,
      data: Array.isArray(missionCards) ? missionCards[p.index] : undefined,
      style: { position: "absolute" as const, left: p.left, top: p.top, transform: `translateZ(0) scale(${p.scale ?? 1})` },
      delay: 60 * i,
    })),
    []
  );
  const mobileBottomCards = useMemo(
    () => (Array.isArray(mobileLayout.bottom) ? mobileLayout.bottom : []).map((p, i) => ({
      key: `m-bot-${p.index}`,
      data: Array.isArray(missionCards) ? missionCards[p.index] : undefined,
      style: { position: "absolute" as const, left: p.left, top: p.top, transform: `translateZ(0) scale(${p.scale ?? 1})` },
      delay: 60 * i + 240,
    })),
    []
  );

  const valueCardWidth = useMemo(() => Math.max(210, Math.min(250, Math.round(viewport.w * 0.19))), [viewport.w]);
  const valueCardHeight = useMemo(
    () => Math.max(340, Math.min(400, Math.round(Math.min(viewport.h * 0.38, viewport.w * 0.44)))),
    [viewport.h, viewport.w]
  );

  const isMobile = viewport.w <= 768;
  return (
    <div
      className="relative w-full bg-[#fdf8f7] flex flex-col pb-0"
      style={{
        paddingBottom: 0,
        isolation: "isolate",
        ...(isMobile
          ? {
              contain: "layout paint",
              overflow: "hidden",
              minHeight: "100vh",
              zIndex: 0,
            }
          : {}),
      }}
    >
      <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
        {/* static bg circle — no animation */}
        <img
          className="pointer-events-none select-none absolute w-[520px] h-[520px] md:w-[820px] md:h-[820px] left-0 object-cover z-0 opacity-100"
          style={{ top: "20%" }}
          alt=""
          src={backgroundCircle}
          loading="eager"
          decoding="async"
          fetchPriority="low"
          draggable={false}
        />

        {/* MISSION */}
        <section
        ref={missionRef}
        data-inview={missionInView ? "true" : "false"}
        className="relative w-full h-auto md:h-[89vh] lg:h-[89vh] flex flex-col md:justify-center items-center pt-4 md:pt-0"
        style={{
          backgroundImage: `url(${backgroundDecor})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          overflow: "visible",
          transform: "translateZ(0)",
        }}
      >
        {/* desktop copy (flow-in) */}
        <div className="absolute top-1/2 left-1/2 z-20 text-center hidden md:block" style={{ transform: "translate(-50%, calc(-50% - 10px))" }}>
          <h1 className="font-['Lexend'] font-normal text-black text-3xl md:text-4xl lg:text-5xl mb-2 flow-in" style={{ animationDelay: "60ms" }}>
            Our Mission
          </h1>
          <div className="w-[320px] md:w-[480px] lg:w-[600px] mx-auto space-y-3 px-6 md:px-8 lg:px-10">
            <p className="[font-family:'Inter',Helvetica] text-black text-lg md:text-xl leading-6 md:leading-7 lg:leading-[30px] text-center flow-in" style={{ animationDelay: "120ms" }}>
              Every woman deserves care, support, and a healthy life during her menstrual journey. At Aangan, we're
              here to provide that through knowledge and a compassionate community.
            </p>
            <p className="font-['Noto_Nastaliq_Urdu'] text-black text-lg md:text-xl leading-7 md:leading-8 lg:leading-[32px] text-center [direction:rtl] flow-in" style={{ animationDelay: "180ms" }}>
              ماہواری کے دوران تندرستی ہر خاتون کا حق ہے۔ ہم علم اور کمینٹی سپورٹ کے ذریعے خواتین کو صحت بخش زندگی گزارنے کے قابل بنانے کے لئے کوشاں ہیں۔
            </p>
          </div>
        </div>

        {/* Mission Cards */}
        <div className="md:absolute md:inset-0 z-30">
          {/* MOBILE */}
          <div className="block md:hidden">
            <div className="flex flex-col gap-3 py-3 px-3" data-inview={missionInView ? "true" : "false"}>
              <div className="relative w-full" style={{ height: mobileLayout.canvasTopHeight }}>
                {mobileTopCards.map((c) => (
                  <div key={c.key} className={missionInView ? "flow-in" : undefined} style={{ animationDelay: `${c.delay}ms` }}>
                    <MissionCard
                      cardData={c.data}
                      size={{ width: mobileLayout.cardWidth, height: mobileLayout.cardHeight }}
                      wrapperStyle={c.style}
                      viewportWidth={viewport.w}
                      flowDelay={0}
                    />
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0 px-3 py-1 flex flex-col items-center justify-center">
                <h1 className="font-['Lexend'] font-semibold text-black text-xl xs:text-2xl mb-2 flow-in" style={{ lineHeight: "1.2", animationDelay: "200ms" }}>
                  Our Mission
                </h1>
                <div className="w-full max-w-md mx-auto space-y-2 px-4 xs:px-6">
                  <p className="[font-family:'Inter',Helvetica] text-black text-base xs:text-[15px] leading-6 text-center flow-in" style={{ animationDelay: "240ms" }}>
                    Every woman deserves care, support, and a healthy life during her menstrual journey. At Aangan,
                    we're here to provide that through knowledge and a compassionate community.
                  </p>
                  <p className="font-['Noto_Nastaliq_Urdu'] text-black text-base xs:text-[15px] leading-6 text-center [direction:rtl] flow-in" style={{ animationDelay: "280ms" }}>
                    ماہواری کے دوران تندرستی ہر خاتون کا حق ہے۔ ہم علم اور کمینٹی سپورٹ کے ذریعے خواتین کو صحت بخش زندگی گزارنے کے قابل بنانے کے لئے کوشاں ہیں۔
                  </p>
                </div>
              </div>

              <div className="relative w-full" style={{ height: mobileLayout.canvasBottomHeight }}>
                {mobileBottomCards.map((c) => (
                  <div key={c.key} className={missionInView ? "flow-in" : undefined} style={{ animationDelay: `${c.delay}ms` }}>
                    <MissionCard
                      cardData={c.data}
                      size={{ width: mobileLayout.cardWidth, height: mobileLayout.cardHeight }}
                      wrapperStyle={c.style}
                      viewportWidth={viewport.w}
                      flowDelay={0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tablet and Desktop: Only one layout rendered at a time */}
          {viewport.w > 1200 ? (
            <div className="hidden md:block lg:hidden">
              {/* Original absolute-positioned layout for >1200px */}
              <div className="absolute top-[66px] left-12" style={{ transform: `translateX(${160 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[6]} viewportWidth={viewport.w} flowDelay={60} /></div>
              <div className="absolute bottom-[135px] left-20" style={{ transform: `translateX(${160 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[0]} viewportWidth={viewport.w} flowDelay={120} /></div>
              <div className="absolute" style={{ top: `calc(54% - 40px)`, left: 2, transform: `translateY(-50%) translateX(${150 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[7]} viewportWidth={viewport.w} flowDelay={180} /></div>
              <div className="absolute" style={{ top: `48%`, left: 240, transform: `translateY(-50%) translateX(${130 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[3]} viewportWidth={viewport.w} flowDelay={240} /></div>
              <div className="absolute" style={{ top: `48%`, right: 36, transform: `translateY(-50%) translateX(${-150 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[2]} viewportWidth={viewport.w} flowDelay={300} /></div>
              <div className="absolute top-[92px] right-12" style={{ transform: `translateX(${-140 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[4]} viewportWidth={viewport.w} flowDelay={360} /></div>
              <div className="absolute bottom-[70px] right-20" style={{ transform: `translateX(${-170 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[1]} viewportWidth={viewport.w} flowDelay={420} /></div>
              <div className="absolute" style={{ top: `calc(50% - 40px)`, right: 2, transform: `translateY(-50%) translateX(${-140 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[5]} viewportWidth={viewport.w} flowDelay={480} /></div>
            </div>
          ) : viewport.w > 770 ? (
            // For width 771px to 1200px, show only the 2x2 grid layout
            <div className="block">
              {/* Left 2x2 grid */}
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 grid grid-cols-2 grid-rows-2 gap-4"
                style={{ zIndex: 10 }}
              >
                <MissionCard cardData={missionCards[6]} viewportWidth={viewport.w} flowDelay={60} />
                <MissionCard cardData={missionCards[0]} viewportWidth={viewport.w} flowDelay={120} />
                <MissionCard cardData={missionCards[7]} viewportWidth={viewport.w} flowDelay={180} />
                <MissionCard cardData={missionCards[3]} viewportWidth={viewport.w} flowDelay={240} />
              </div>
              {/* Right 2x2 grid */}
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 grid grid-cols-2 grid-rows-2 gap-4"
                style={{ zIndex: 10 }}
              >
                <MissionCard cardData={missionCards[2]} viewportWidth={viewport.w} flowDelay={300} />
                <MissionCard cardData={missionCards[4]} viewportWidth={viewport.w} flowDelay={360} />
                <MissionCard cardData={missionCards[1]} viewportWidth={viewport.w} flowDelay={420} />
                <MissionCard cardData={missionCards[5]} viewportWidth={viewport.w} flowDelay={480} />
              </div>
            </div>
          ) : null}

          {/* Desktop: Only one layout rendered at a time */}
          {viewport.w > 1200 && (
            <div className="hidden lg:block">
              {/* Original absolute-positioned layout for >1200px */}
              <div className="absolute left-40" style={{ transform: `translateX(${100 * desktopScale}px) scale(${desktopScale})`, top: 80 }}><MissionCard cardData={missionCards[6]} viewportWidth={viewport.w} flowDelay={60} /></div>
              <div className="absolute bottom-[180px] left-32" style={{ transform: `translateX(${140 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[0]} viewportWidth={viewport.w} flowDelay={120} /></div>
              <div className="absolute" style={{ top: `calc(60% - 130px)`, left: '7rem', transform: `translateY(-50%) scale(${desktopScale})` }}><MissionCard cardData={missionCards[7]} viewportWidth={viewport.w} flowDelay={180} /></div>
              <div className="absolute" style={{ top: `44%`, left: 300, transform: `translateY(-50%) translateX(${110 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[3]} viewportWidth={viewport.w} flowDelay={240} /></div>
              <div className="absolute" style={{ top: 80, right: 96, transform: `translateX(${-170 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[4]} viewportWidth={viewport.w} flowDelay={300} /></div>
              <div className="absolute bottom-[183px] right-32" style={{ transform: `translateX(${-120 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[1]} viewportWidth={viewport.w} flowDelay={360} /></div>
              <div className="absolute" style={{ top: `44%`, right: 'calc(10rem + 110px)', transform: `translateY(-50%) translateX(${-140 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[2]} viewportWidth={viewport.w} flowDelay={420} /></div>
              <div className="absolute" style={{ top: `calc(58% + 20px - 140px)`, right: -4, transform: `translateY(-50%) translateX(${-110 * desktopScale}px) scale(${desktopScale})` }}><MissionCard cardData={missionCards[5]} viewportWidth={viewport.w} flowDelay={480} /></div>
            </div>
          )}
        </div>
  </section>

  {/* VALUES */}
  <section
        ref={valuesRef}
        data-inview={valuesInView ? "true" : "false"}
        className="relative w-full h-auto flex flex-col items-center overflow-visible pb-0 mt-[42px] isolate bg-transparent"
        style={{ overflow: "visible", transform: "translateZ(0)" }} /* removed contain:paint to prevent clipping */
      >
        {/* Values section background cloud for all screen sizes */}
        <div className="relative w-full">
          {/* Desktop/Tablet cloud */}
          <img
            className="hidden md:block pointer-events-none select-none absolute right-0 bottom-[-120px] w-[400px] h-[400px] md:w-[640px] md:h-[640px] object-cover z-0 opacity-100"
            alt=""
            src={backgroundCircle2}
            loading="eager"
            decoding="async"
            fetchPriority="low"
            draggable={false}
          />
          {/* Mobile cloud - always behind, negative z-index */}
          <img
            className="block md:hidden pointer-events-none select-none absolute right-0 bottom-[-60px] w-[260px] h-[260px] object-cover -z-10 opacity-100"
            alt=""
            src={backgroundCircle2}
            loading="eager"
            decoding="async"
            fetchPriority="low"
            draggable={false}
            style={{ left: 'auto' }}
          />
          {/* Values section content always above the cloud */}
          <div className="relative z-10">
            <div className="max-w-5xl mx-auto px-4 text-center pt-4 pb-3 lg:pb-5 -mt-[26px]">
              <h2 className="font-['Lexend'] font-normal text-black text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-4 flow-in" style={{ animationDelay: "60ms" }}>
                Aangan Values
              </h2>
              <p className="[font-family:'Inter',Helvetica] text-[#212121] text-sm md:text-base lg:text-lg leading-6 md:leading-7 max-w-3xl mx-auto flow-in" style={{ animationDelay: "120ms" }}>
                At Aangan, we nurture a vision rooted in empathy, dignity, and desi values—where every woman feels seen,
                supported, and in control of her health.
              </p>
            </div>


            {/* MOBILE deck only, no cloud here! */}
            <div className="block md:hidden relative w-full max-w-[1600px] mx-auto px-3">
              <div className="relative z-10 flow-in" style={{ animationDelay: "180ms" }}>
                <ValuesDeck visible={true} viewportW={viewport.w} viewportH={viewport.h} />
              </div>
            </div>

            {/* TABLET/DESKTOP grid */}
            <div className="hidden md:block relative w-full max-w-[1600px] mx-auto px-4 lg:px-6 z-10">
              <div
                role="region"
                aria-label="Aangan Values grid"
                tabIndex={0}
                className="flex flex-wrap justify-center gap-6 md:gap-7 lg:gap-8 pt-2 pb-14"
                style={{ minHeight: 400, marginBottom: 0, paddingBottom: 56, width: "100%" }}
              >
                {(Array.isArray(valuesCards) ? valuesCards : []).map((card, i) => (
                  <div
                    key={`value-card-${i}`}
                    className="group flex-shrink-0 flow-in z-10"
                    style={{
                      width: `min(100%, ${valueCardWidth}px)`,
                      maxWidth: 320,
                      minWidth: 220,
                      animationDelay: `${80 + i * 60}ms`,
                    }}
                  >
                    <Card
                      className={`relative inner-border-glow-hover bg-white rounded-[22px] md:rounded-[24px] lg:rounded-[26px] value-zoom border border-[#efc7d7] z-10`}
                      style={{
                        width: `min(100%, ${valueCardWidth}px)`,
                        height: `${valueCardHeight}px`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        contain: "paint",
                      }}
                    >
                      <CardContent className="h-full p-5 md:p-6 flex flex-col justify-between items-center text-center">
                        <div className="flex-shrink-0">
                          <h3 className="font-['Lexend'] text-[#212121] leading-tight whitespace-pre-line mb-3 md:mb-4 text-[18px] md:text-[20px]">
                            {card.title}
                          </h3>
                          <img
                            src={decorativePencilLine}
                            alt="decorative pencil line"
                            className="mx-auto my-2"
                            style={{ maxWidth: 120, width: "100%", height: "auto" }}
                            draggable={false}
                          />
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <p
                            className="[font-family:'Inter',Helvetica] text-[#212121] text-[12.5px] md:text-sm leading-6 text-center"
                            style={{ display: "-webkit-box", WebkitLineClamp: viewport.h < 720 ? 9 : 10, WebkitBoxOrient: "vertical", textOverflow: "ellipsis" }}
                          >
                            {card.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
