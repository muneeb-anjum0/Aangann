import React, { memo, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import woman1 from "../assets/hero/woman1.png";
import woman2 from "../assets/hero/woman2.png";
import woman3 from "../assets/hero/woman3.png";
import woman4 from "../assets/hero/woman4.png";
import cloud from "../assets/hero/cloud.svg";
import cloudWebp from "../assets/hero/cloud.webp";

// Smoothly interpolate between two values
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Responsive style for woman4 image
function getWoman4Style() {
  const w = window.innerWidth;
  // 320px to 1280px: interpolate size
  const t = Math.max(0, Math.min(1, (w - 320) / (1280 - 320)));
  const maxWidth = lerp(140, 420, t); // px
  const width = lerp(55, 23, t); // percent/vw
  const marginTop = lerp(-68, -36, t); // px // move up by another 20px
  const top = lerp(-56, -53, t); // px // move up by another 20px
  return {
    maxWidth: `${maxWidth}px`,
    width: w < 640 ? `${width}%` : `${lerp(17, 17, t)}vw`,
    marginTop: `${marginTop}px`,
    marginLeft: "-35%", 
    zIndex: 0,
    position: "relative" as const,
    top: `${top}px`,
    willChange: "transform, opacity",
    pointerEvents: "none" as any,
    userSelect: "none" as any,
  };
}

// --- Static cloud styles ---
// Bottom-left cloud for desktop
const cloudBLDesktopStyle = Object.freeze({
  position: "absolute",
  bottom: "-250px",
  left: "-170px",
  width: "60vw",
  height: "auto",
  opacity: 0.8,
  transform: "rotate(-155deg) translateZ(0) scaleX(1) scaleY(-1)",
  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.08))",
  pointerEvents: "none" as const,
  userSelect: "none",
  willChange: "transform, opacity",
});

// Bottom-left cloud for mobile
const cloudBLMobileStyle = Object.freeze({
  position: "absolute",
  top: "350px",
  left: "-40px",
  width: "120vw",
  height: "auto",
  opacity: 0.9,
  transform: "rotate(25deg) scaleX(-1) scaleY(1)",
  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.08))",
  pointerEvents: "none" as const,
  userSelect: "none",
  zIndex: 0,
  willChange: "transform, opacity",
});

// Top-right cloud for desktop
const cloudTRDesktopStyle = Object.freeze({
  position: "absolute",
  top: "-350px",
  right: "-310px",
  width: "60vw",
  height: "auto",
  opacity: 0.8,
  transform: "rotate(15deg) translateZ(0) scaleX(1) scaleY(-1)",
  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.08))",
  pointerEvents: "none",
  userSelect: "none",
  willChange: "transform, opacity",
});

// Top-right cloud for mobile
const cloudTRMobileStyle = Object.freeze({
  position: "absolute",
  top: "-80px",
  right: "-50px",
  width: "110vw",
  height: "auto",
  opacity: 0.9,
  transform: "rotate(20deg) scaleX(1) scaleY(-1)",
  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.08))",
  pointerEvents: "none",
  userSelect: "none",
  zIndex: 1,
  willChange: "transform, opacity",
});

// Responsive style for woman1 image
function getWoman1Style() {
  const w = window.innerWidth;
  const t = Math.max(0, Math.min(1, (w - 320) / (1280 - 320)));
  const maxWidth = lerp(120, 340, t); // px
  const width = lerp(48, 14, t); // percent/vw
  const marginTop = lerp(8, 44, t); // px
  return {
    maxWidth: `${maxWidth}px`,
    width: w < 640 ? `${width}%` : `${lerp(14, 14, t)}vw`,
  marginTop: `${marginTop}px`,
  position: "relative" as const,
  marginLeft: w < 640 ? "12%" : "3vw", // increase left margin a bit more
  top: "-62px", // move up by another 20px
    willChange: "transform, opacity",
    pointerEvents: "none" as any,
    userSelect: "none" as any,
  };
}


// Responsive style for woman2 image
function getWoman2Style() {
  const w = window.innerWidth;
  const t = Math.max(0, Math.min(1, (w - 320) / (1280 - 320)));
  const maxWidth = lerp(110, 360, t); // px
  const width = lerp(44, 13, t); // percent/vw
  const marginTop = lerp(-8, 24, t); // px
  return {
    maxWidth: `${maxWidth}px`,
    width: w < 640 ? `${width}%` : `${lerp(13, 13, t)}vw`,
  marginTop: `${marginTop}px`,
  marginLeft: "-40%",
  position: "relative" as const,
  top: "-58px", // move up by another 20px
    willChange: "transform, opacity",
    pointerEvents: "none" as any,
    userSelect: "none" as any,
  };
}

// Responsive style for woman3 image
function getWoman3Style() {
  const w = window.innerWidth;
  const t = Math.max(0, Math.min(1, (w - 320) / (1280 - 320)));
  const maxWidth = lerp(115, 380, t); // px
  const width = lerp(46, 14, t); // percent/vw
  const marginTop = lerp(-8, 24, t); // px
  return {
    maxWidth: `${maxWidth}px`,
    width: w < 640 ? `${width}%` : `${lerp(14, 14, t)}vw`,
  marginTop: `${marginTop}px`,
  marginLeft: "-40%",
  position: "relative" as const,
  top: "-57px", // move up by another 20px
    willChange: "transform, opacity",
    pointerEvents: "none" as any,
    userSelect: "none" as any,
  };
}
// Hook to detect if screen is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 640);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}



// --- Animation variants: fade only (fixed position) ---
const buildVariants = (reduced: boolean) => {
  const noAnim = { opacity: 1 };
  const fadeIn = { opacity: 1 };
  const fadeOut = { opacity: 0 };

  return {
    containerInitial: reduced ? noAnim : fadeOut,
    containerAnimate: reduced ? noAnim : fadeIn,
    h1Initial: reduced ? noAnim : fadeOut,
    h1Animate: reduced ? noAnim : fadeIn,
    h2Initial: reduced ? noAnim : fadeOut,
    h2Animate: reduced ? noAnim : fadeIn,
    p1Initial: reduced ? noAnim : fadeOut,
    p1Animate: reduced ? noAnim : fadeIn,
    p2Initial: reduced ? noAnim : fadeOut,
    p2Animate: reduced ? noAnim : fadeIn,
    rowInitial: reduced ? noAnim : fadeOut,
    rowAnimate: reduced ? noAnim : fadeIn,

    // Each image: fade only
    w0Initial: reduced ? noAnim : fadeOut,
    w0Animate: reduced ? noAnim : fadeIn,
    w1Initial: reduced ? noAnim : fadeOut,
    w1Animate: reduced ? noAnim : fadeIn,
    w2Initial: reduced ? noAnim : fadeOut,
    w2Animate: reduced ? noAnim : fadeIn,
    w3Initial: reduced ? noAnim : fadeOut,
    w3Animate: reduced ? noAnim : fadeIn,
    w4Initial: reduced ? noAnim : fadeOut,
    w4Animate: reduced ? noAnim : fadeIn,
    w5Initial: reduced ? noAnim : fadeOut,
    w5Animate: reduced ? noAnim : fadeIn,
  };
};

// --- Animation timings ---
const t = {
  container: { delay: 0.3, duration: 0.6, ease: "easeOut" as const },
  h1: { delay: 0.45, duration: 0.6, ease: "easeOut" as const },
  h2: { delay: 0.6, duration: 0.6, ease: "easeOut" as const },
  p1: { delay: 0.7, duration: 0.5, ease: "easeOut" as const },
  p2: { delay: 0.8, duration: 0.5, ease: "easeOut" as const },
  row: { delay: 0.9, duration: 0.6, ease: "easeOut" as const },
  // Slight stagger for images; all fade only
  w1: { delay: 1.0, duration: 0.6, ease: "easeOut" as const },
  w2: { delay: 1.1, duration: 0.6, ease: "easeOut" as const },
  w3: { delay: 1.2, duration: 0.6, ease: "easeOut" as const },
  w4: { delay: 1.3, duration: 0.6, ease: "easeOut" as const },
  w5: { delay: 1.4, duration: 0.6, ease: "easeOut" as const },
  w6: { delay: 1.5, duration: 0.6, ease: "easeOut" as const },
};

// Main Hero section component
const HeroComponent: React.FC = memo(() => {

  const reducedMotion = !!useReducedMotion();
  // Memoize variants for less recalculation
  const v = useMemo(() => buildVariants(reducedMotion), [reducedMotion]);
  const timings = useMemo(() => t, []);
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        ...(isMobile
          ? {
              contain: "layout paint",
              overflow: "hidden",
              isolation: "isolate",
              zIndex: 0,
            }
          : {}),
      }}
    >
      {/* Mobile clouds */}
      <div
        className="sm:hidden"
        style={{ position: "absolute", inset: 0, width: "100vw", height: "100%", zIndex: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <motion.picture initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.2 }}>
          <source srcSet={cloudWebp} type="image/webp" />
          <img src={cloud} alt="" style={cloudBLMobileStyle} loading="lazy" decoding="async" fetchPriority="low" width="600" height="300" sizes="100vw" />
        </motion.picture>
        
        <motion.picture initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.4 }}>
          <source srcSet={cloudWebp} type="image/webp" />
          <img src={cloud} alt="" style={cloudTRMobileStyle} loading="lazy" decoding="async" fetchPriority="low" width="600" height="300" sizes="100vw" />
        </motion.picture>
      </div>

      {/* Desktop clouds */}
      <motion.picture initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.2 }}>
        <source srcSet={cloudWebp} type="image/webp" />
        <img
          src={cloud}
          alt=""
          aria-hidden="true"
          className="hidden sm:block select-none pointer-events-none"
          style={cloudBLDesktopStyle}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width="800"
          height="400"
          sizes="60vw"
        />
      </motion.picture>
      <motion.picture initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.4 }}>
        <source srcSet={cloudWebp} type="image/webp" />
        <img
          src={cloud}
          alt=""
          aria-hidden="true"
          className="hidden sm:block select-none pointer-events-none"
          style={cloudTRDesktopStyle}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width="800"
          height="400"
          sizes="60vw"
        />
      </motion.picture>

      <section
        id="home"
        aria-labelledby="hero-title"
        className="relative w-full flex items-center justify-center px-6 md:px-16 pb-4 md:pb-24 hero-section-desktop"
        style={{
          minHeight: "100vh",
          overflow: "hidden",
          contain: "layout paint",
          willChange: "transform",
          overscrollBehavior: "contain",
          overscrollBehaviorY: "contain",
          touchAction: "pan-y",
          contentVisibility: "auto",
          // Move up on mobile: reduce top margin and padding
          marginTop: isMobile ? '-48px' : undefined,
          paddingTop: isMobile ? '0' : undefined,
        }}
      >
        <motion.div
          className={
            "text-center max-w-4xl z-10 " +
            (isMobile
              ? "py-2 mt-32" // increased mt-20 to mt-32 for maximum space on mobile
              : "py-12 sm:py-16 mt-[50px] sm:mt-[60px]")
          }
          initial={v.containerInitial}
          animate={v.containerAnimate}
          transition={timings.container}
        >
          <motion.h1
            id="hero-title"
            className="font-poppins font-semibold leading-[120%] text-gray-800 text-[clamp(30px,7vw,56px)] -mt-6 sm:mt-10"
            initial={v.h1Initial}
            animate={v.h1Animate}
            transition={timings.h1}
          >
            <span className="tracking-wide">Empower</span> <span className="font-bold text-[#fc9ac3] tracking-wide">Her,</span>
          </motion.h1>

          <motion.h2
            className="font-poppins font-normal leading-[1.05] text-gray-800 mt-1 sm:mt-2 text-[clamp(34px,9vw,60px)] whitespace-nowrap"
            initial={v.h2Initial}
            animate={v.h2Animate}
            transition={timings.h2}
          >
            <span className="mr-[0.08em]">One</span>
            <span className="font-bold text-[#fc9ac3] mx-[0.08em] tracking-wide">Cycle</span>
            <span className="ml-[0.08em]">At a Time</span>
          </motion.h2>

          <motion.p className="mt-4 sm:mt-8 text-md md:text-lg font-semibold italic text-gray-700" initial={v.p1Initial} animate={v.p1Animate} transition={timings.p1}>
            Know your cycle. Own your rhythm.
          </motion.p>

          <motion.p className="mt-2 sm:mt-3 text-sm md:text-base text-gray-600 max-w-xl mx-auto" initial={v.p2Initial} animate={v.p2Animate} transition={timings.p2}>
            Track periods, moods, and symptoms effortlessly with Aangan. Get smart insights, gentle guidance, and feel supported every step of the way.
          </motion.p>

          <motion.div
            className="mt-8 sm:mt-10 flex justify-center items-end gap-20 sm:gap-64"
            initial={v.rowInitial}
            animate={v.rowAnimate}
            transition={timings.row}
            style={{ willChange: "transform" }}
          >

            <motion.img
              src={woman1}
              alt="Woman using phone"
              className="h-56 sm:h-72 md:h-80 lg:h-[26rem] object-contain transform-gpu"
              style={getWoman1Style()}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              initial={v.w1Initial}
              animate={v.w1Animate}
              transition={timings.w1}
              sizes="(max-width: 1024px) 60vw, 420px"
            />
            {/* woman2 removed */}
            <motion.img
              src={woman2}
              alt="Woman smiling"
              className="-ml-8 sm:-ml-32 lg:-ml-48 h-56 sm:h-72 md:h-80 lg:h-[26rem] object-contain transform-gpu"
              style={getWoman2Style()}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              initial={v.w3Initial}
              animate={v.w3Animate}
              transition={timings.w3}
              sizes="(max-width: 1024px) 60vw, 420px"
            />
            <motion.img
              src={woman3}
              alt="Woman standing right"
              className="-ml-3 sm:-ml-24 lg:-ml-32 h-56 sm:h-72 md:h-80 lg:h-[26rem] object-contain transform-gpu"
              style={{ ...getWoman3Style(), zIndex: 1, position: "relative" }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              initial={v.w4Initial}
              animate={v.w4Animate}
              transition={timings.w4}
              sizes="(max-width: 1024px) 60vw, 420px"
            />
            <motion.img
              src={woman4}
              alt="Woman far right"
              className="-ml-3 sm:-ml-24 lg:-ml-32 h-56 sm:h-72 md:h-80 lg:h-[26rem] object-contain transform-gpu"
              style={getWoman4Style()}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              initial={v.w5Initial}
              animate={v.w5Animate}
              transition={timings.w5}
              sizes="(max-width: 1024px) 60vw, 420px"
            />
          </motion.div>
        </motion.div>
      </section>
  </div>
  );
});

const Hero = memo(HeroComponent);
export default Hero;
