import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Blog } from "../types";

export default function TopHeader({ blog }: { blog?: Blog }) {
  // Only render if blog is loaded
  if (!blog) return null;

  const title = blog.title;
  // Convert various date formats to Date
  function toDateSafe(val: any): Date {
    if (!val) return new Date(0);
    if (typeof val === "string" || typeof val === "number") return new Date(val);
    if (typeof val === "object" && typeof val.toDate === "function") return val.toDate();
    if (typeof val === "object" && typeof val.seconds === "number") return new Date(val.seconds * 1000);
    return new Date(0);
  }
  const dateStr = toDateSafe(blog.publishedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "2-digit",
  });
  const minutes = blog.minutesRead ?? 5;

  // Get up to 4 categories
  const rawCats = Array.isArray(blog.categories) ? blog.categories : [];
  const categories = rawCats.map((c) => String(c).trim()).filter(Boolean);
  const MAX_BADGES = 4;
  const shownCats = categories.slice(0, MAX_BADGES);
  const moreCount = Math.max(0, categories.length - shownCats.length);

  const [isDark, setIsDark] = useState(false);

  // Check if blog image is dark for text color
  useEffect(() => {
    if (!blog.thumbnailUrl) {
      setIsDark(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = blog.thumbnailUrl;
    img.onload = () => {
      try {
        const S = 16;
        const c = document.createElement("canvas");
        c.width = S; c.height = S;
        const ctx = c.getContext("2d");
        if (!ctx) return setIsDark(false);
        ctx.drawImage(img, 0, 0, S, S);
        const { data } = ctx.getImageData(0, 0, S, S);
        let sum = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; // Rec.709
          sum += lum; n++;
        }
        setIsDark(sum / n < 130);
      } catch {
        setIsDark(false);
      }
    };
    img.onerror = () => setIsDark(false);
  }, [blog.thumbnailUrl]);

  const titleCls = isDark ? "text-white" : "text-neutral-900";
  // (metaCls unused)
  const dotCls = "text-black opacity-80";
  const badgeCls = isDark
    ? "px-2 py-1 rounded-full bg-white/15 text-white ring-1 ring-white/30"
    : "px-2 py-1 rounded-full bg-white text-neutral-700 ring-1 ring-neutral-200";

  return (
    <section className="relative mb-8 md:mb-12 overflow-hidden">
      <div className="container-wide pt-10 md:pt-16">
        <Link
          to={`/blog/${blog.slug}`}
          className="block relative h-[340px] md:h-[500px] rounded-[32px] overflow-hidden"
        >
          {/* Blog background image */}
          {blog.thumbnailUrl && (
            <img
              src={blog.thumbnailUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Visual overlays for readability */}
          <div className={`absolute inset-0 ${isDark ? "bg-black/20" : "bg-white/20"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute inset-0 ring-1 ring-white/50" />

          {/* Blog title and meta info */}
          <div className="absolute left-6 right-6 bottom-6 md:left-10 md:right-10 md:bottom-10">
            <h1 className={`text-4xl md:text-6xl font-semibold tracking-tight max-w-4xl ${titleCls}`}>
              {title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span
                className="px-3 py-1 rounded-[1.5rem] bg-white/90 backdrop-blur-lg shadow-lg border border-white/70 text-neutral-900 flex items-center gap-2"
                style={{
                  boxShadow: '0 4px 18px 0 rgba(0,0,0,0.10)',
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                  fontWeight: 500,
                  background: 'linear-gradient(90deg,rgba(255,255,255,0.92) 60%,rgba(245,245,255,0.85) 100%)',
                }}
              >
                <span>{dateStr}</span>
                <span className={dotCls}>•</span>
                <span>{minutes} Minutes Read</span>
              </span>
              {/* Show blog categories as badges */}
              {shownCats.map((c) => (
                <span key={c} className={badgeCls}>{c}</span>
              ))}
              {moreCount > 0 && <span className={badgeCls}>+{moreCount}</span>}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
