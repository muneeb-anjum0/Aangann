// Convert Firestore Timestamp or string/number to Date
function toDateSafe(val: any): Date {
  if (!val) return new Date(0);
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  if (typeof val === "object" && typeof val.toDate === "function") return val.toDate();
  if (typeof val === "object" && typeof val.seconds === "number") return new Date(val.seconds * 1000);
  return new Date(0);
}
// Blog detail page
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logoMark from "../assets/navbar/aangan-logo-mark.svg";
import textLogo from "../assets/navbar/aangan-text-logo.png";
// BlogBackNavbar matches Blog page style
function BlogBackNavbar() {
  // ...existing code...

  return (
    <motion.nav
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
        "bg-white/40 shadow-sm backdrop-blur-md backdrop-saturate-150",
        "md:bg-white/20 md:backdrop-blur-lg md:backdrop-saturate-200 md:shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
      ].join(" ")}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="container mx-auto h-full px-4 md:px-6">
        <div className="flex h-full items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 md:gap-3"
            style={{ textDecoration: 'none' }}
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
          </Link>
          {/* No nav links for blog, but you could add them here if needed */}
          <div className="flex-1" />
          {/* CTA: Back to Blogs */}
          <Link
            to="/blog"
            aria-label="Back to Blogs"
            style={{ marginLeft: 'auto' }}
            className="inline-flex items-center rounded-full border border-pink-300 bg-white/60 shadow-sm px-5 py-2 font-semibold text-base text-pink-700 hover:bg-pink-100 transition-all duration-150 gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-1 mr-1">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Blogs</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import backgroundCircle from "../assets/missionVision/background-circle.svg";
import backgroundCircle2 from "../assets/missionVision/background-circle2.svg";
// Generate or get a persistent device ID
function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
  // Generate a UUID v4 string
  // Use a string template for UUID v4
    id = '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: string) =>
      (
        Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
      ).toString(16)
    );
    localStorage.setItem("deviceId", id ?? '');
  }
  return id;
}
import type { Blog } from "../types";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);

  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Micro-animations
  // (nudge unused)
  // (burst unused)
  const [showLure, setShowLure] = useState(false);


  useEffect(() => {
  let t1: number | undefined;
  let t2: number | undefined;
  let t3: number | undefined;

    (async () => {
    const deviceId = getDeviceId();
    const b = await api.get<Blog>(`/blogs/slug/${slug}`).then((r) => r.data);
      setBlog(b);
      window.scrollTo(0, 0);

  // Store last visited blogs in localStorage
      try {
        const key = "recentBlogs";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
  // Remove if already exists
        const filtered = prev.filter((item: any) => item._id !== b._id);
  // Add new at the start
        filtered.unshift({
          _id: b._id,
          title: b.title,
          slug: b.slug,
          thumbnailUrl: b.thumbnailUrl,
          publishedAt: b.publishedAt,
        });
  // Keep only last 5
        const recent = filtered.slice(0, 5);
        localStorage.setItem(key, JSON.stringify(recent));
      } catch {}

  // Use backend likedBy to set liked state
  const liked = Array.isArray(b.likedBy) && b.likedBy.includes(deviceId ?? '');
  setLiked(liked);

      const params = new URLSearchParams(window.location.search);
      const forceLure = params.get("lure") === "1";

  // Nudge + Lure earlier
      if (forceLure || !liked) {
  // (t1 unused)
        t2 = window.setTimeout(() => setShowLure(true), 2000);
  // Hide lure automatically if no interaction
        if (!forceLure) t3 = window.setTimeout(() => setShowLure(false), 16000);
      }
    })();

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [slug]);

  const toggleLike = async () => {
    if (!blog || liking) return;
    const blogId = blog._id || blog.id;
    const deviceId = getDeviceId();
  // Optimistic update
    const prevLiked = liked;
    const prevLikes = blog.likes || 0;
    const newLiked = !liked;
    const newLikes = prevLikes + (newLiked ? 1 : -1);
    setLiked(newLiked);
    setBlog({ ...blog, likes: newLikes });
  // (setNudge unused)
    setShowLure(false);
  // (newLiked unused)
  //   setBurst(true);
  //   setTimeout(() => setBurst(false), 450);
  // }
    setLiking(true);
    try {
  const endpoint = newLiked ? `/blogs/${blogId}/like` : `/blogs/${blogId}/unlike`;
      const res = await api.post<{ likes: number, liked: boolean }>(endpoint, { deviceId });
      const likes = typeof res.data?.likes === "number"
        ? res.data.likes
        : Math.max(0, newLikes);
      setBlog({ ...blog, likes });
      setLiked(!!res.data?.liked);
    } catch (e: any) {
      // Revert optimistic update
      setLiked(prevLiked);
      setBlog({ ...blog, likes: prevLikes });
      alert(e?.response?.data?.message || "Could not update like. Please try again.");
    } finally {
      setLiking(false);
    }
  };


  // Skeleton loader while loading
  if (!blog) {
    return (
      <>
        <BlogBackNavbar />
        <div style={{ height: '0.5rem' }} />
        <div className="pb-20 animate-pulse">
          <div className="container-wide pt-24 md:pt-32">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <div className="h-10 md:h-16 w-3/4 bg-neutral-200 rounded mb-4" />
                <div className="flex gap-3 mb-4">
                  <div className="h-4 w-20 bg-neutral-200 rounded" />
                  <div className="h-4 w-8 bg-neutral-200 rounded" />
                  <div className="h-4 w-24 bg-neutral-200 rounded" />
                </div>
                <div className="h-10 w-32 bg-neutral-200 rounded mb-4" />
              </div>
              <div className="md:col-span-5">
                <div className="w-full aspect-video bg-neutral-200 rounded-2xl shadow-soft" />
              </div>
            </div>
          </div>
          <div className="container-wide mt-10">
            <div className="prose-aangan">
              <div className="h-6 w-3/4 bg-neutral-200 rounded mb-2" />
              <div className="h-6 w-2/3 bg-neutral-200 rounded mb-2" />
              <div className="h-6 w-1/2 bg-neutral-200 rounded mb-2" />
              <div className="h-6 w-5/6 bg-neutral-200 rounded mb-2" />
              <div className="h-6 w-1/3 bg-neutral-200 rounded mb-2" />
            </div>
            <div className="mt-10 flex justify-between">
              <div className="h-6 w-32 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Force lure via ?lure=1 for testing
  const forceLure = new URLSearchParams(window.location.search).get("lure") === "1";
  const lureVisible = (showLure && !liked) || forceLure;

  return (
    <>
      <BlogBackNavbar />
      <div style={{ height: '0.5rem' }} />
      {/* Decorative Backgrounds - absolutely positioned inside main content, do not affect layout height */}
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-0 w-full h-full overflow-visible z-0">
          <img
            src={backgroundCircle}
            alt="Decorative left circle"
            className="hidden md:block absolute left-0 top-0 -translate-x-1/12 -mt-[51rem] w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480 }}
            aria-hidden="true"
          />
          <img
            src={backgroundCircle}
            alt="Decorative left circle"
            className="hidden md:block absolute left-0 top-0 -translate-x-1/12 -mt-96 w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480, transform: "scaleY(-1)" }}
            aria-hidden="true"
          />
          <img
            src={backgroundCircle}
            alt="Decorative right mirrored circle"
            className="hidden md:block absolute right-0 top-0 translate-x-1/12 -mt-4 w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480, transform: "scale(-1)", }}
            aria-hidden="true"
          />
          
          <img
            src={backgroundCircle2}
            alt="Decorative right circle"
            className="hidden md:block absolute left-0 top-0 translate-x-1/6 mt-44 w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480, transform: "scaleX(-1)", }}
            aria-hidden="true"
          />
          <img
            src={backgroundCircle}
            alt="Decorative right mirrored circle"
            className="hidden md:block absolute left-0 top-0 translate-x-1/12 mt-[30rem] w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480, transform: "scale(1)", }}
            aria-hidden="true"
          />
          <img
            src={backgroundCircle2}
            alt="Decorative right circle"
            className="hidden md:block absolute right-0 top-0 translate-x-1/6 mt-[32rem] w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480, transform: "scaleX(1)", }}
            aria-hidden="true"
          />
          <img
            src={backgroundCircle2}
            alt="Decorative right circle"
            className="hidden md:block absolute left-0 top-0 translate-x-1/6 mt-[64rem] w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480, transform: "scaleX(-1)", }}
            aria-hidden="true"
          />
          <img
            src={backgroundCircle}
            alt="Decorative right circle"
            className="hidden md:block absolute right-0 top-0 translate-x-1/6 mt-[50rem] w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480, transform: "scaleX(-1)", }}
            aria-hidden="true"
          />
        </div>
      </div>
      <motion.div
        className="pb-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container-wide pt-24 md:pt-32">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">


              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-xl mb-6 text-neutral-900">
                {blog.title}
              </h1>

                      {/* Minimal meta row */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-base font-medium relative z-10">
                        <span className="flex items-center gap-2 text-neutral-700/90 text-sm md:text-base">
                          {toDateSafe(blog.publishedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                          <span className="mx-1 text-neutral-400">•</span>
                          {blog.minutesRead} min read
                        </span>
                        {blog.categories.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-full bg-pink-50/80 text-pink-600 font-semibold text-xs md:text-sm border border-pink-100/80"
                            style={{letterSpacing: '0.01em'}}>{c}</span>
                        ))}
                      </div>

              {/* like row — sits just below the date/meta */}
              <div className="mt-3 flex items-center gap-3">
                <motion.button
                  onClick={toggleLike}
                  disabled={liking}
                  aria-label={liked ? "Unlike this blog post" : "Like this blog post"}
                  aria-pressed={liked}
                  title={liked ? "Unlike" : "Like"}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: liked ? 1.08 : 1.13 }}
                  className={[
                    "like-btn group relative flex items-center justify-center gap-1 px-2 py-1 text-base font-semibold transition-all duration-150",
                    "bg-white/80 border border-pink-200 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300",
                    liked ? "text-pink-600" : "text-black/40 hover:text-pink-500 hover:bg-pink-50/80",
                    liking ? "opacity-80" : "cursor-pointer",
                  ].join(" ")}
                  style={{ minWidth: 36, borderRadius: 999 }}
                >
                  <motion.svg
                    className={["heart transition-all duration-150 w-6 h-6", liked ? "is-liked text-pink-600 scale-110" : "group-hover:text-pink-500"].join(" ")}
                    viewBox="0 0 24 24"
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    animate={liked ? { scale: [1, 1.3, 1.15] } : { scale: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      filter: liked ? "drop-shadow(0 0 4px #f9b2c5aa)" : undefined,
                      transition: 'all 0.15s cubic-bezier(.4,0,.2,1)'
                    }}
                  >
                    <path d="M12 20.5c-2.2-2-6.5-5.2-8.1-8.1C2.1 8.2 4.2 5.7 7.1 5.7c1.3 0 2.5.7 3.2 1.8C11 6.4 12.2 5.7 13.5 5.7c2.9 0 5 2.5 3.2 6.7-1.6 2.9-5.9 6.1-8.1 8.1z" />
                  </motion.svg>
                  <span className="ml-1 text-base font-medium select-none transition-all duration-150" key={blog.likes}>
                    {(blog.likes ?? 0).toLocaleString()}
                  </span>
                  {liking && (
                    <span className="ml-1 animate-spin inline-block w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full align-middle" aria-label="Loading"></span>
                  )}
                </motion.button>
                <style>{`
                  .like-btn {
                    box-shadow: 0 2px 12px 0 rgba(249,178,197,0.18), 0 1.5px 6px 0 rgba(91,42,54,0.08);
                  }
                  .like-btn .heart.is-liked {
                    animation: pop-heart 0.25s cubic-bezier(.4,0,.2,1);
                  }
                  @keyframes pop-heart {
                    0% { transform: scale(1); }
                    60% { transform: scale(1.35); }
                    100% { transform: scale(1.25); }
                  }
                `}</style>

                {/* Animated lure (clicking it also likes). Dev: add ?lure=1 to always show */}
                {lureVisible && (
                  <button
                    type="button"
                    onClick={toggleLike}
                    className="like-lure z-10 visible"
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-5 flex items-center justify-center">
              <div className="relative w-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl pointer-events-none animate-gradient-border z-10" style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, #f9b2c5 0deg, #fff 90deg, #f9b2c5 180deg, #fff 270deg, #f9b2c5 360deg)',
                  filter: 'blur(8px)',
                  opacity: 0.7
                }} />
                <img src={blog.thumbnailUrl} alt="" className="w-full max-h-[420px] object-cover rounded-3xl shadow-2xl border-4 border-white/80 bg-white/40 backdrop-blur-2xl relative z-20" />
              </div>
            </div>
          </div>
        </div>

        <div className="container-wide mt-10">
          <motion.article
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="prose-aangan relative z-10"
            dangerouslySetInnerHTML={{ __html: blog.html }}
          />
        </div>
      </motion.div>
    </>
  );
}
