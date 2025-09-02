// WhyAangan: Interactive story section with scroll-based scenes
import cloudWebp from "../assets/hero/cloud.webp";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";


// Scene 1 images
import womanImg from "../assets/whyAangan/storypt1/woman.png";
import bubble2Img from "../assets/whyAangan/storypt1/bubble1.png";
import bubble1Img from "../assets/whyAangan/storypt1/bubble2.png";
import bubble4Img from "../assets/whyAangan/storypt1/bubble3.png";
import bubble3Img from "../assets/whyAangan/storypt1/bubble4.png";
// Scene 2 images
import secondBubble1Img from "../assets/whyAangan/storypt2/secondBubble1.png";
import secondBubble2Img from "../assets/whyAangan/storypt2/secondBubble2.png";
import secondBubble3Img from "../assets/whyAangan/storypt2/secondBubble3.png";
import handPhoneImg from "../assets/whyAangan/storypt2/handPhone.png";
import secondBubble4Img from "../assets/whyAangan/storypt2/secondBubble4.png";
// Scene 3 images
import woman2Img from "../assets/whyAangan/storypt3/woman2.png";
import lastBubble1Img from "../assets/whyAangan/storypt3/lastBubble1.png";
import lastBubble2Img from "../assets/whyAangan/storypt3/lastBubble2.png";
import lastBubble3Img from "../assets/whyAangan/storypt3/lastBubble3.png";
import lastBubble4Img from "../assets/whyAangan/storypt3/lastBubble4.png";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const map01 = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));

type Item = { id: string; src: string; style: React.CSSProperties; start: number; span: number; scene: 0 | 1 | 2; z: number; };
type SceneEl = { src: string; desktop: React.CSSProperties; mobile?: React.CSSProperties; };
type Geom = { pinHeight: number; scrollLenBase: number; pinStart: number; pinEnd: number; anchorTop: number; };

// Z-index for mobile layering
const Z_MOBILE_CLOUDS = 2;
const Z_MOBILE_GRID = 3; // Lines layer (behind images)
const Z_MOBILE_TITLE = 4;
const Z_MOBILE_IMAGES_BASE = 6;

// Main component
const WhyAangan: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Animation timeline
  const progress = useRef(0);
  const target = useRef(0);
  const raf = useRef<number | null>(null);

  // Image cache
  const nodesMap = useRef<Map<string, HTMLImageElement>>(new Map());
  const prevAlpha = useRef<Map<string, number>>(new Map());

  // Navbar height
  const [offsetPx, setOffsetPx] = useState<number>(42);

  // Desktop image scaling
  const [desktopScale, setDesktopScale] = useState(1);
  // Fullscreen desktop width
  const DESKTOP_BASE_WIDTH = 1440;
  const MIN_DESKTOP_WIDTH = 375;

  // Scroll capture length
  const PIN_VH = 340;

  // Responsive flags
  const [isMobile, setIsMobile] = useState(false);
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iP(hone|od|ad)/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));

  const BOTTOM_GUTTER = isMobile ? 40 : 70;

  // Stable mobile viewport
  const mobileBaseVH = useRef<number>(0);

  // Mobile scroll velocity tracking
  const lastY = useRef<number>(0);
  const lastT = useRef<number>(performance.now());
  const dirRef = useRef<1 | -1>(1);

  // Geometry
  const geomRef = useRef<Geom | null>(null);

  // Timeline slices for scenes
  const S1_START = 0.0, S1_END = 1 / 3;
  const S2_START = 1 / 3, S2_END = 2 / 3;
  const S3_START = 2 / 3, S3_END = 1.0;

  const HEAD = 0.06, TAIL = 0.15;

  const releaseAt = () => (isMobile ? 0.96 : 0.995);

  // UI state
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const [uiPinned, setUiPinned] = useState(false);

  // Handle media query and desktop scaling
  useEffect(() => {
    const MOBILE_BREAKPOINT = 768;
    const handleResize = () => {
  // Switch to mobile layout at 768px or below
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
  // Always scale for widths above 375px
      if (window.innerWidth > MIN_DESKTOP_WIDTH) {
        const scale = Math.max(
          MIN_DESKTOP_WIDTH / DESKTOP_BASE_WIDTH,
          Math.min(1, window.innerWidth / DESKTOP_BASE_WIDTH)
        );
        setDesktopScale(scale);
      } else {
        setDesktopScale(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Get navbar height
  const getNavOffset = () => {
    const explicit = document.querySelector<HTMLElement>("#navbar, [data-navbar]");
    if (explicit) return explicit.getBoundingClientRect().height || 0;
    const candidates = Array.from(document.querySelectorAll<HTMLElement>("header, nav"));
    for (const el of candidates) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" && (cs.top === "0px" || cs.top === "0")) {
        return el.getBoundingClientRect().height || 0;
      }
    }
    return 42;
  };

  // Viewport helpers
  const getVhDesktop = () => window.innerHeight;
  const getVhMobileStable = () => mobileBaseVH.current || window.innerHeight;
  const getScrollY = () => window.scrollY || window.pageYOffset || 0;

  // Layout helpers
  // Scale maxWidth for desktop images
  const scaleStyle = (style: React.CSSProperties): React.CSSProperties => {
    if (!('maxWidth' in style) || typeof style.maxWidth !== 'number') return style;
    return { ...style, maxWidth: style.maxWidth * desktopScale };
  };

  const s1Desktop: SceneEl[] = [
    { src: womanImg, desktop: scaleStyle({ position: "relative", display: "block", margin: "160px auto 0", maxWidth: 400 }) },
    { src: bubble1Img, desktop: scaleStyle({ position: "absolute", right: "19%", top: "20%", maxWidth: 350 }) },
    { src: bubble2Img, desktop: scaleStyle({ position: "absolute", left: "19%", top: "20%", maxWidth: 350 }) },
    { src: bubble3Img, desktop: scaleStyle({ position: "absolute", left: "21%", top: "55%", maxWidth: 350 }) },
    { src: bubble4Img, desktop: scaleStyle({ position: "absolute", right: "21%", top: "55%", maxWidth: 350 }) },
  ];
  const s2Desktop: SceneEl[] = [
    { src: secondBubble1Img, desktop: scaleStyle({ position: "absolute", left: "16%", top: "4%", maxWidth: 450 }) },
    { src: secondBubble2Img, desktop: scaleStyle({ position: "absolute", left: "18%", top: "31%", maxWidth: 450 }) },
    { src: secondBubble3Img, desktop: scaleStyle({ position: "absolute", right: "18%", top: "36%", maxWidth: 450 }) },
    { src: handPhoneImg, desktop: scaleStyle({ position: "absolute", left: "47%", top: "50%", transform: "translate(-50%, -50%)", maxWidth: 548 }) },
    { src: secondBubble4Img, desktop: scaleStyle({ position: "absolute", right: "29%", top: "16%", maxWidth: 400 }) },
  ];
  const s3Desktop: SceneEl[] = [
    { src: woman2Img, desktop: scaleStyle({ position: "absolute", left: "37%", top: "8%", maxWidth: 425 }) },
    { src: lastBubble1Img, desktop: scaleStyle({ position: "absolute", right: "12%", top: "12%", maxWidth: 450 }) },
    { src: lastBubble2Img, desktop: scaleStyle({ position: "absolute", right: "12%", top: "53%", maxWidth: 450 }) },
    { src: lastBubble3Img, desktop: scaleStyle({ position: "absolute", left: "12%", top: "12%", maxWidth: 450 }) },
    { src: lastBubble4Img, desktop: scaleStyle({ position: "absolute", left: "12%", top: "53%", maxWidth: 450 }) },
  ];

  // Mobile scene layouts
  const s1Mobile: SceneEl[] = [
    { src: womanImg, desktop: {}, mobile: { position: "relative", display: "block", margin: "160px auto 0", width: "75vw", height: "auto" } },
    { src: bubble1Img, desktop: {}, mobile: { position: "absolute", right: "0vw", top: "11vh", width: "50vw", height: "auto" } },
    { src: bubble2Img, desktop: {}, mobile: { position: "absolute", left: "0vw", top: "11vh", width: "50vw", height: "auto" } },
    { src: bubble3Img, desktop: {}, mobile: { position: "absolute", left: "0vw", top: "56vh", width: "50vw", height: "auto" } },
    { src: bubble4Img, desktop: {}, mobile: { position: "absolute", right: "0vw", top: "53vh", width: "50vw", height: "auto" } },
  ];
  const s2Mobile: SceneEl[] = [
    { src: secondBubble2Img, desktop: {}, mobile: { position: "absolute", left: "-11vw", top: "-3vh", width: "75vw", height: "auto" } },
    { src: secondBubble3Img, desktop: {}, mobile: { position: "absolute", left: "-12vw", top: "40vh", width: "75vw", height: "auto" } },
    { src: handPhoneImg, desktop: {}, mobile: { position: "absolute", left: "50%", top: "43vh", transform: "translate(-50%, -50%)", width: "80vw", height: "auto" } },
    { src: secondBubble4Img, desktop: {}, mobile: { position: "absolute", right: "-11vw", top: "8vh", width: "70vw", height: "auto" } },
  ];
  const s3Mobile: SceneEl[] = [
    { src: woman2Img, desktop: {}, mobile: { position: "absolute", left: "48%", top: "8vh", transform: "translateX(-50%)", width: "77vw", height: "auto" } },
    { src: lastBubble1Img, desktop: {}, mobile: { position: "absolute", right: "10vw", top: "8vh", width: "48vw", height: "auto" } },
    { src: lastBubble2Img, desktop: {}, mobile: { position: "absolute", right: "6vw", top: "62vh", width: "48vw", height: "auto" } },
    { src: lastBubble3Img, desktop: {}, mobile: { position: "absolute", left: "6vw", top: "22vh", width: "48vw", height: "auto" } },
    { src: lastBubble4Img, desktop: {}, mobile: { position: "absolute", left: "6vw", top: "48vh", width: "48vw", height: "auto" } },
  ];

  // Build scene items
  const items: Item[] = [];
  const pushScene = (scene: 0 | 1 | 2, a: number, b: number, arr: SceneEl[]) => {
    const innerStart = HEAD;
    const innerEnd = scene === 2 ? 1 : 1 - TAIL;
    const innerRange = innerEnd - innerStart;
  const slot = innerRange / arr.length;
    const fade = Math.min(1, slot * 0.9);
    arr.forEach((el, i) => {
      const startNorm = innerStart + i * slot;
      const style = isMobile ? (el.mobile || el.desktop) : el.desktop;
      items.push({
        id: `wa-item-${scene}-${i}`,
        src: el.src,
        style: { ...style },
        start: a + startNorm * (b - a),
        span: fade * (b - a),
        scene,
  z: (isMobile ? Z_MOBILE_IMAGES_BASE : 2) + items.length, // Images above grid on mobile
      });
    });
  };
  pushScene(0, S1_START, S1_END, isMobile ? s1Mobile : s1Desktop);
  pushScene(1, S2_START, S2_END, isMobile ? s2Mobile : s2Desktop);
  pushScene(2, S3_START, S3_END, isMobile ? s3Mobile : s3Desktop);

  // Preload S2/S3 images
  useEffect(() => {
    const preload = (srcs: string[]) => {
      const idle = (cb: () => void) =>
        ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 0));
      idle(() => srcs.forEach((s) => { const i = new Image(); i.decoding = "async"; i.src = s; }));
    };
    preload([secondBubble1Img, secondBubble2Img, secondBubble3Img, secondBubble4Img, handPhoneImg]);
    preload([woman2Img, lastBubble1Img, lastBubble2Img, lastBubble3Img, lastBubble4Img]);
  }, []);

  // Cache image nodes
  const itemsKey = `${isMobile ? "m" : "d"}-${items.length}`;
useLayoutEffect(() => {
  nodesMap.current.clear();
  prevAlpha.current.clear();
  const host = pinRef.current;
  if (!host) return;
  const imgs = Array.from(host.querySelectorAll<HTMLImageElement>('img[id^="wa-item-"]'));
  for (const node of imgs) {
    nodesMap.current.set(node.id, node);
    prevAlpha.current.set(node.id, -1);
    node.style.willChange = "transform, opacity";
    node.style.pointerEvents = "none";
    (node.style as any).contain = "paint";
    node.style.backfaceVisibility = "hidden";
    node.style.visibility = "visible";
    const base = node.style.transform || "";
    node.style.transform = `${base} translate3d(0,0,0)`;
    node.style.opacity = "0";
  // (removed: node.style.zIndex = "2")
  }
  requestAnimationFrame(() => render(clamp01(target.current)));
}, [itemsKey]);


  // Animation frame loop
  const startLoop = () => {
    if (raf.current != null) return;
    const tick = () => {
      const p = progress.current;
      const t = clamp01(target.current);
      const ease = isMobile ? (dirRef.current === -1 ? 0.26 : 0.22) : 0.14;
      const next = Math.abs(t - p) < (isMobile ? 0.003 : 0.001) ? t : lerp(p, t, ease);
      progress.current = next;
      render(next);
      const DEAD_BAND = isMobile ? 0.0035 : 0.001;
      if (Math.abs(t - next) > DEAD_BAND) raf.current = requestAnimationFrame(tick);
      else { progress.current = t; render(t); raf.current = null; }
    };
    raf.current = requestAnimationFrame(tick);
  };

  // Alpha values for fade
  const sceneAlpha = (p: number, a: number, b: number, hasTail: boolean) => {
    const headA = a, headB = a + HEAD * (b - a);
    const tailB = b, tailA = hasTail ? b - TAIL * (b - a) : b;
    const head = smooth(map01(p, headA, headB));
    const tail = hasTail ? (1 - smooth(map01(p, tailA, tailB))) : 1;
    return Math.min(head, tail);
  };
  const sceneAlphaNoTail = (p: number, a: number, b: number) => {
    const headA = a, headB = a + HEAD * (b - a);
    return smooth(map01(p, headA, headB));
  };

  const render = (p: number) => {
    const s1A = sceneAlpha(p, S1_START, S1_END, true);
    const s2A = sceneAlpha(p, S2_START, S2_END, true);
    const s3A = sceneAlphaNoTail(p, S3_START, S3_END);

    const envByScene = [s1A, s2A, s3A] as const;
    const HEAD_M = 0.05;
    const TAIL_M = 0.14;
    const WRITE_EPS = isMobile ? 0.02 : 0.01;

    for (const it of items) {
      const scStart = it.scene === 0 ? S1_START : it.scene === 1 ? S2_START : S3_START;
      const scEnd   = it.scene === 0 ? S1_END   : it.scene === 1 ? S2_END   : S3_END;
      const activeStart = Math.max(0, scStart - HEAD_M);
      const activeEnd   = it.scene < 2 ? Math.min(1, scEnd + TAIL_M) : 1.0;

      if (p < activeStart || p > activeEnd) {
        const env = envByScene[it.scene];
        if (env < 0.004) {
          const node = nodesMap.current.get(it.id);
          if (node) {
            if (node.style.opacity !== "0") node.style.opacity = "0";
            if (node.style.willChange) node.style.willChange = "";
            prevAlpha.current.set(it.id, 0);
          }
        }
        continue;
      }

      const node = nodesMap.current.get(it.id);
      if (!node) continue;

      const itemA = smooth(map01(p, it.start, it.start + it.span));
      const env = envByScene[it.scene];
      const a = itemA * env;

      const prev = prevAlpha.current.get(it.id) ?? -1;
      if (Math.abs(a - prev) < WRITE_EPS) continue;
      prevAlpha.current.set(it.id, a);

      const base = (it.style.transform as string) || "";
      const ty = (1 - a) * (isMobile ? 14 : 16);
      node.style.transform = `${base} translate3d(0, ${ty}px, 0)`;
      node.style.opacity = `${a}`;

      if (a > 0.02 && node.style.willChange !== "transform, opacity") node.style.willChange = "transform, opacity";
      if (a < 0.005 && node.style.willChange) node.style.willChange = "";
    }

    if (progressFillRef.current) {
      progress.current = clamp01(p);
      progressFillRef.current.style.transition = isMobile ? "none" : "height 60ms linear";
      progressFillRef.current.style.height = `${progress.current * 100}%`;
      (progressFillRef.current.parentElement as HTMLElement).style.opacity =
        progress.current >= releaseAt() ? "0.25" : (uiPinned ? "1" : "0");
    }
  };

  // Pin helpers
  const applyFixed = (pin: HTMLDivElement, pinHeight: number) => {
    if (pin.style.position === "fixed" && pin.style.height === `${pinHeight}px`) return;
    pin.style.position = "fixed";
    pin.style.top = `${offsetPx}px`;
    pin.style.left = "0";
    pin.style.right = "0";
    pin.style.width = "100vw";
    pin.style.height = `${pinHeight}px`;
    pin.style.transform = "";
    pin.style.transition = "";
    pin.style.zIndex = "60";
  };
  const applyAbsoluteAt = (pin: HTMLDivElement, pinHeight: number, topPx: number) => {
    const tp = Math.round(topPx);
    if (pin.style.position === "absolute" && pin.style.top === `${tp}px` && pin.style.height === `${pinHeight}px`) return;
    pin.style.position = "absolute";
    pin.style.top = `${tp}px`;
    pin.style.left = "0";
    pin.style.right = "0";
    pin.style.width = "100vw";
    pin.style.height = `${pinHeight}px`;
    pin.style.transform = "";
    pin.style.transition = "";
    pin.style.zIndex = "60";
  };

  // Recompute layout (desktop)
  const recomputeDesktop = () => {
    const pin = pinRef.current;
    const g = geomRef.current;
    if (!pin || !g) return;

    const pageY = Math.round(getScrollY());
    const raw = (pageY - g.pinStart) / g.scrollLenBase;
    const rawClamped = clamp01(raw);
    target.current = rawClamped;

    render(rawClamped);
    startLoop();

    if (rawClamped >= releaseAt()) {
      applyAbsoluteAt(pin, g.pinHeight, g.anchorTop);
      if (uiPinned) setUiPinned(false);
      return;
    }

    const ENTER_PAD = 72, EXIT_PAD = 56;
    const padEnterTop = g.pinStart + ENTER_PAD;
    const padEnterBot = g.pinEnd - ENTER_PAD;
    const padExitTop = g.pinStart + EXIT_PAD;
    const padExitBot = g.pinEnd - EXIT_PAD;

    let region: "above" | "within" | "below";
    if ((!uiPinned && pageY < padEnterTop) || (uiPinned && pageY < padExitTop)) region = "above";
    else if ((!uiPinned && pageY >= padEnterBot) || (uiPinned && pageY >= padExitBot)) region = "below";
    else region = "within";

    if (region === "above") {
      applyAbsoluteAt(pin, g.pinHeight, offsetPx);
      if (uiPinned) setUiPinned(false);
      return;
    }
    if (region === "below") {
      applyAbsoluteAt(pin, g.pinHeight, g.anchorTop);
      if (uiPinned) setUiPinned(false);
      return;
    }

    applyFixed(pin, g.pinHeight);
    if (!uiPinned) setUiPinned(true);
  };

  // Recompute layout (mobile)
  const recomputeMobileFixed = () => {
    const pin = pinRef.current;
    const g = geomRef.current;
    if (!pin || !g) return;

    const now = performance.now();
    const pageY = Math.round(getScrollY());
    const vy = (pageY - lastY.current) / Math.max(1, now - lastT.current);
    dirRef.current = vy < 0 ? -1 : 1;

    const raw = (pageY - g.pinStart) / g.scrollLenBase;
    const rawClamped = clamp01(raw);
    target.current = rawClamped;
    startLoop();

    if (rawClamped >= releaseAt()) {
      applyAbsoluteAt(pin, g.pinHeight, g.anchorTop);
      if (uiPinned) setUiPinned(false);
      lastY.current = pageY;
      lastT.current = now;
      return;
    }

    const ENTER_PAD = 40, EXIT_PAD = 40, ENTER_PAD_UP = 60, EXIT_PAD_UP = 60;
    const enterPad = vy < 0 ? ENTER_PAD_UP : ENTER_PAD;
    const exitPad = vy < 0 ? EXIT_PAD_UP : EXIT_PAD;

    const padEnterTop = g.pinStart + enterPad;
    const padEnterBot = g.pinEnd - enterPad;
    const padExitTop = g.pinStart + exitPad;
    const padExitBot = g.pinEnd - exitPad;

    let region: "above" | "within" | "below";
    if ((!uiPinned && pageY < padEnterTop) || (uiPinned && pageY < padExitTop)) region = "above";
    else if ((!uiPinned && pageY >= padEnterBot) || (uiPinned && pageY >= padExitBot)) region = "below";
    else region = "within";

    if (region === "above") {
      applyAbsoluteAt(pin, g.pinHeight, offsetPx);
      if (uiPinned) setUiPinned(false);
    } else if (region === "below") {
      applyAbsoluteAt(pin, g.pinHeight, g.anchorTop);
      if (uiPinned) setUiPinned(false);
    } else {
      applyFixed(pin, g.pinHeight);
      if (!uiPinned) setUiPinned(true);
    }

    lastY.current = pageY;
    lastT.current = now;
  };

  // Debounce helper
  const debounce = (fn: () => void, ms: number) => {
    let t: number | undefined;
    return () => { if (t) window.clearTimeout(t); t = window.setTimeout(fn, ms); };
  };

  // Geometry builders
  const rebuildGeometry = () => {
    const outer = sectionRef.current;
    if (!outer) return;

    const vh = isMobile ? getVhMobileStable() : getVhDesktop();
    const pinHeight = Math.max(vh - offsetPx, 1);
    const scrollLenBase = Math.max(outer.offsetHeight - pinHeight, 1);
    const sectionTopAbs = Math.round(outer.getBoundingClientRect().top + getScrollY());
    const pinStart = Math.round(sectionTopAbs - offsetPx);
    const pinEnd = pinStart + scrollLenBase;
    const anchorTop = scrollLenBase - BOTTOM_GUTTER + offsetPx;

    geomRef.current = { pinHeight, scrollLenBase, pinStart, pinEnd, anchorTop };
  };

  // Navbar height (debounced)
  useEffect(() => {
    const apply = () => setOffsetPx(getNavOffset());
    apply();
    const onResize = debounce(apply, 200);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize as any);
  }, []);

  useEffect(() => {
    const setMobileBase = (force = false) => {
      if (isMobile) {
        if (isIOS && mobileBaseVH.current && !force) return;
        const vv = (window as any).visualViewport?.height ?? 0;
        mobileBaseVH.current = Math.max(window.innerHeight, vv || 0) || window.innerHeight;
      }
    };

    const applyHeights = () => {
      const outer = sectionRef.current;
      if (!outer) return;
      const vh = isMobile ? getVhMobileStable() : getVhDesktop();
      const targetPx = (PIN_VH / 100) * vh + offsetPx + BOTTOM_GUTTER;
      outer.style.height = `${Math.round(targetPx)}px`;
    };

  // Initial setup
    setMobileBase(true);
    applyHeights();
    rebuildGeometry();
    render(0);

    const onScroll = () => (isMobile ? recomputeMobileFixed() : recomputeDesktop());

    const onResize = debounce(() => {
      if (!isIOS) setMobileBase();
      applyHeights();
      rebuildGeometry();
      isMobile ? recomputeMobileFixed() : recomputeDesktop();
    }, 200);

    const onOrient = () => {
      setMobileBase(true);
      applyHeights();
      rebuildGeometry();
      isMobile ? recomputeMobileFixed() : recomputeDesktop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize as any);
    window.addEventListener("orientationchange", onOrient);

    lastY.current = getScrollY();
    lastT.current = performance.now();
    requestAnimationFrame(() => (isMobile ? recomputeMobileFixed() : recomputeDesktop()));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize as any);
      window.removeEventListener("orientationchange", onOrient);
    };
  }, [isMobile, offsetPx, BOTTOM_GUTTER, isIOS]);

  // Desktop grid
  const progressBarRight = isMobile ? 10 : 24;
  const GRID_TILE =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='2' height='56'><rect x='0' y='0' width='100%' height='1' fill='rgba(252,154,195,0.25)'/></svg>\")";

  // Mobile grid via CSS gradient (more reliable on iOS Safari)
  const MOBILE_GRID_BG = "repeating-linear-gradient(to bottom, rgba(252,154,195,0.28) 0, rgba(252,154,195,0.28) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 56px)";

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100vw",
        margin: 0,
        padding: 0,
        marginTop: isMobile ? "12px" : "48px",
        background: "transparent",
        isolation: "isolate",
        zIndex: 40,
        overscrollBehaviorY: "contain",
        touchAction: "manipulation",
        WebkitOverflowScrolling: "touch" as any,
        overflowAnchor: "none",
        overflow: isMobile ? "visible" : undefined,
      }}
    >
      <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
      <style>{`
        @keyframes wa-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        @keyframes wa-pulse { 0%{opacity:.25} 50%{opacity:1} 100%{opacity:.25} }
        @keyframes wa-chevron { 0%{transform:translateY(0);opacity:.8} 50%{transform:translateY(4px);opacity:1} 100%{transform:translateY(0);opacity:.8} }
      `}</style>

      <div
        ref={pinRef}
        style={{
          position: "absolute",
          top: `${offsetPx}px`,
          left: 0,
          right: 0,
          width: "100vw",
          height: "100%",
          overflow: "visible",
          background: "transparent",
          willChange: "transform",
          zIndex: 60,
        }}
      >
        {/* desktop lines layer (unchanged) */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            backgroundImage: GRID_TILE, backgroundSize: "100% 56px", backgroundRepeat: "repeat-y", willChange: "opacity",
            display: isMobile ? "none" : "block",
          }}
        />

        {/* Clouds */}
        <img
          src={cloudWebp}
          alt="cloud background"
          aria-hidden
          style={
            isMobile
              ? { position: "absolute", top: "-24vw", right: "-8vw", width: "130vw", height: "auto", zIndex: Z_MOBILE_CLOUDS, opacity: 0.75, pointerEvents: "none", userSelect: "none", filter: isIOS ? "none" : "blur(0.5px)", transform: "scaleY(-1) rotate(-19deg)" }
              : { position: "absolute", top: "-250px", right: "-90px", width: "840px", height: "auto", zIndex: 2, opacity: 0.8, pointerEvents: "none", userSelect: "none", filter: isIOS ? "none" : "blur(0.5px)", transform: "scaleY(-1) rotate(-19deg)" }
          }
        />
        <img
          src={cloudWebp}
          alt="cloud background"
          aria-hidden
          style={
            isMobile
              ? { position: "absolute", bottom: "-44vw", left: "-8vw", width: "130vw", height: "auto", zIndex: Z_MOBILE_CLOUDS, opacity: 0.8, pointerEvents: "none", userSelect: "none", filter: isIOS ? "none" : "blur(0.5px)", transform: "scaleX(-1) rotate(-19deg)" }
              : { position: "absolute", left: "-60px", bottom: "-190px", width: "840px", height: "auto", zIndex: 2, opacity: 0.8, pointerEvents: "none", userSelect: "none", filter: isIOS ? "none" : "blur(0.5px)", transform: "scaleX(-1) rotate(-19deg)" }
          }
        />

        {/* MOBILE lines layer (above clouds, behind images) */}
        {isMobile && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: Z_MOBILE_GRID,
              pointerEvents: "none",
              background: MOBILE_GRID_BG,
              willChange: "opacity",
            }}
          />
        )}

        <h2
          ref={titleRef}
          style={{
            position: "relative",
            zIndex: isMobile ? Z_MOBILE_TITLE : 3,
            textAlign: "center",
            margin: isMobile ? "12px 16px 8px" : "16px",
            fontSize: isMobile ? "clamp(22px, 6vw, 30px)" : "2.5rem",
            lineHeight: 1.1,
            fontFamily: "Poppins, sans-serif"
          }}
        >
          Why <span style={{ color: "#000" }}>Aangan?</span>
        </h2>

        {items.map((it) => {
          const eager = isMobile ? true : it.scene === 0;
          return (
            <img
              key={it.id}
              id={it.id}
              src={it.src}
              alt=""
              decoding="async"
              loading={eager ? "eager" : "lazy"}
              style={{
                ...it.style,
                opacity: 0,
                transform: (it.style.transform as string) || "translate3d(0, 0, 0)",
                transition: "none",
                pointerEvents: "none",
                visibility: "visible",
                contain: "paint" as any,
                backfaceVisibility: "hidden",
                display: "block",
                zIndex: it.z, // images > grid on mobile
              }}
            />
          );
        })}

        {/* Progress bar */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: progressBarRight,
            top: isMobile ? 80 : 110,
            height: isMobile ? "60vh" : "64vh",
            width: 6,
            background: "rgba(255,255,255,0.35)",
            borderRadius: 999,
            zIndex: 20,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
            opacity: uiPinned ? 1 : 0,
            transition: "opacity 150ms ease",
            pointerEvents: "none",
          }}
        >
          <div
            ref={progressFillRef}
            style={{
              position: "absolute", left: 0, top: 0, width: "100%", height: "0%",
              background: "linear-gradient(180deg, #ff8fbd, #ff5fa2)", borderRadius: 999,
              transition: isMobile ? "none" : "height 60ms linear",
            }}
          />
          <div style={{ position: "absolute", left: "50%", top: "33.33%", transform: "translateX(-50%)", width: 10, height: 2, background: "rgba(0,0,0,0.15)", borderRadius: 2 }} />
          <div style={{ position: "absolute", left: "50%", top: "66.66%", transform: "translateX(-50%)", width: 10, height: 2, background: "rgba(0,0,0,0.15)", borderRadius: 2 }} />
        </div>
      {/* Add extra space at the bottom when locked/pinned on mobile */}
      {isMobile && uiPinned && (
        (() => {
          let sectionOffset = 0;
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            sectionOffset = Math.round(rect.top);
          }
          const gridHeight = 56;
          const bgPosY = ((-sectionOffset + 20) % gridHeight) + 'px';
          return (
            <div
              style={{
                width: "100%",
                height: 112, // 2 lines (2 * 56px)
                background: MOBILE_GRID_BG,
                backgroundPositionY: bgPosY,
                pointerEvents: "none",
                zIndex: Z_MOBILE_GRID,
              }}
            />
          );
        })()
      )}
      </div>
      </div>
    </section>
  );
};

export default WhyAangan;
