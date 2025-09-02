import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logoMark from "../assets/navbar/aangan-logo-mark.svg";
import textLogo from "../assets/navbar/aangan-text-logo.png";
// Blog page with back navbar
function BlogBackNavbar() {
  // Use same button style and glass layers as main Navbar


  return (
    <motion.nav
  initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 18,
        mass: 0.7,
        delay: 0.01,
        bounce: 0.45,
        duration: 0.28
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
          {/* CTA Button: Back to Website */}
          <Link
            to="/"
            aria-label="Back to Website"
            style={{ marginLeft: 'auto' }}
            className="inline-flex items-center rounded-full border border-pink-300 bg-white/60 shadow-sm px-5 py-2 font-semibold text-base text-pink-700 hover:bg-pink-100 transition-all duration-150 gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-1 mr-1">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Website</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
import api from "../lib/api";
import TopHeader from "../components/TopHeader";
import backgroundCircle from "../assets/missionVision/background-circle.svg";
import backgroundCircle2 from "../assets/missionVision/background-circle2.svg";
import MostLikedGrid from "../components/MostLikedGrid";
// Skeleton placeholder for TopHeader
import { useRef } from "react";
function TopHeaderPlaceholder({ fadeIn }: { fadeIn?: boolean }) {
  return (
    <section className="relative mb-8 md:mb-12 overflow-hidden">
      <div className="container-wide pt-10 md:pt-16">
        <div className={`block relative h-[340px] md:h-[500px] rounded-[32px] overflow-hidden skeleton${fadeIn ? ' skeleton-fadein' : ''}`}>
          {/* Simulated overlays */}
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute inset-0 ring-1 ring-white/50" />

          {/* Title + meta skeleton */}
          <div className="absolute left-6 right-6 bottom-6 md:left-10 md:right-10 md:bottom-10">
            <div className={`h-12 md:h-16 w-3/4 md:w-2/3 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''} mb-4`} />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <div className={`h-4 w-20 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
              <div className={`h-4 w-4 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
              <div className={`h-4 w-24 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
              <div className={`h-4 w-16 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
              <div className={`h-4 w-16 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import SearchBar from "../components/SearchBar";
import { ListBlock } from "../components/Lists";
import type { Blog } from "../types";

const PAGE_SIZE = 5;

// API endpoint for most liked blogs
const MOST_LIKED_URL = "/blogs/most-liked";


export default function Blog() {
  const [featured, setFeatured] = useState<Blog | undefined>(undefined);
  const [all, setAll] = useState<Blog[]>([]);
  const [monthlyTop, setMonthlyTop] = useState<Blog[]>([]);
  const [mostLiked, setMostLiked] = useState<Blog[]>([]);
  const [latestPage, setLatestPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMostLiked, setLoadingMostLiked] = useState(true);
  const [skeletonFadeIn, setSkeletonFadeIn] = useState(true);
  const fadeInTimeout = useRef<number | null>(null);

  const load = async (query = "") => {
    setLoading(true);
    try {
      const sec = await api
        .get("/blogs/sections")
        .then((r) => r.data);
      setFeatured(sec.featured);
      setMonthlyTop(Array.isArray(sec.monthlyTop) ? sec.monthlyTop : []);

      const list = await api
        .get("/blogs", { params: query ? { q: query } : {} })
        .then((r) => Array.isArray(r.data) ? r.data : []);
      setAll(Array.isArray(list) ? list : []);
      setLatestPage(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch most liked blogs
  const loadMostLiked = async () => {
    setLoadingMostLiked(true);
    try {
      const blogs = await api.get(MOST_LIKED_URL).then(r => Array.isArray(r.data) ? r.data : []);
      setMostLiked(blogs);
    } finally {
      setLoadingMostLiked(false);
    }
  };

  useEffect(() => {
    load();
    loadMostLiked();
    // Only fade in skeletons on first mount
    fadeInTimeout.current = setTimeout(() => setSkeletonFadeIn(false), 900);
    return () => {
      if (fadeInTimeout.current) clearTimeout(fadeInTimeout.current);
    };
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(all.length / PAGE_SIZE);
  const latestPageItems = all.slice((latestPage - 1) * PAGE_SIZE, latestPage * PAGE_SIZE);

  return (
    <>
      <BlogBackNavbar />
      <div style={{ height: '0.5rem' }} /> {/* Further reduced spacer for fixed navbar */}
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
            className="hidden md:block absolute right-0 top-0 translate-x-1/6 -mt-80 w-72 md:w-[28rem] opacity-90"
            style={{ minWidth: 180, maxWidth: 480 }}
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
      <div className="container mx-auto py-4 pt-6 md:pt-10 relative overflow-hidden">

        <div className="relative z-10" id="blog-top">
          {/* Show a skeleton placeholder for TopHeader if loading, else show real featured */}
          {loading ? <TopHeaderPlaceholder fadeIn={skeletonFadeIn} /> : featured && <TopHeader blog={featured} />}
        </div>
        <SearchBar onSearch={load} />
        <div className="container-wide mt-1 grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <ListBlock
              title="Top 5 Monthly"
              items={loading ? [] : monthlyTop}
              placeholderCount={loading ? 5 : 0}
              skeletonFadeIn={skeletonFadeIn}
            />
          </section>
          <section className="flex flex-col">
            <ListBlock
              title="Latest"
              items={loading ? [] : latestPageItems}
              placeholderCount={
                loading
                  ? PAGE_SIZE
                  : latestPageItems.length < PAGE_SIZE
                    ? PAGE_SIZE - latestPageItems.length
                    : 0
              }
              skeletonFadeIn={skeletonFadeIn}
              startIndex={(latestPage - 1) * PAGE_SIZE}
            />
            {!loading && totalPages > 1 && (
              <nav className="mt-4 flex flex-wrap items-center justify-center mb-2" aria-label="Latest pages">
                <div className="inline-flex rounded-full border border-pink-300 overflow-hidden bg-white/60 shadow-sm">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n, idx) => (
                    <button
                      key={n}
                      onClick={() => setLatestPage(n)}
                      className={`
                        px-2.5 py-1 font-semibold text-sm transition-all duration-150
                        ${n === latestPage
                          ? 'bg-pink-100 text-pink-700 z-10'
                          : 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-pink-500'}
                        ${idx === 0 ? 'rounded-l-full' : ''}
                        ${idx === totalPages - 1 ? 'rounded-r-full' : ''}
                        border-0
                      `}
                      aria-current={n === latestPage ? "page" : undefined}
                      title={`Go to page ${n}`}
                      style={{ minWidth: 28 }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </nav>
            )}
          </section>
        </div>
        {/* Decorative background image above Most Liked Blogs section */}
        
        {/* Most Liked Blogs Section */}
        <div className="container-wide">
          {!loadingMostLiked && mostLiked.length > 0 && (
            <MostLikedGrid blogs={mostLiked} />
          )}
        </div>
      </div>
    </>
  );
}
