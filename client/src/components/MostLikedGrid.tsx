import type { Blog } from "../types";
import { Link } from "react-router-dom";

// Convert various date formats to Date
function toDateSafe(val: any): Date {
  if (!val) return new Date(0);
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  if (typeof val === "object" && typeof val.toDate === "function") return val.toDate();
  if (typeof val === "object" && typeof val.seconds === "number") return new Date(val.seconds * 1000);
  return new Date(0);
}

// Grid of most liked blogs
export default function MostLikedGrid({ blogs }: { blogs: Blog[] }) {
  return (
    <div className="mt-16">
      <h3 className="h2 mb-6 text-center">Most Liked Blogs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {blogs.map((b, i) => (
          <div key={b._id || b.id} className="relative">
            {/* Like count badge outside card */}
            <span
              className="absolute -top-3 right-2 z-20 px-3 py-1 rounded-full font-bold text-xs backdrop-blur-md bg-white/70 text-black shadow-lg border border-neutral-200 flex items-center gap-1"
              style={{ minWidth: 38, textAlign: 'center', backdropFilter: 'blur(8px)' }}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" className="inline-block mr-1 text-black"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
              {b.likes ?? 0}
            </span>
            <Link
              to={`/blog/${b.slug}`}
              className="group block rounded-xl overflow-hidden border border-pink-100 bg-white/60 hover:bg-pink-50/60 transition-all shadow-sm relative"
              style={{ minHeight: 220 }}
            >
              {/* Number badge */}
              <span
                className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full font-bold text-xs shadow ${i === 0 ? 'scale-110' : ''}`}
                style={{
                  minWidth: 28,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.7)',
                  color: i === 0 ? '#be185d' : '#52525b',
                  border: '1px solid #e5e7eb',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                }}
              >
                {i + 1}
              </span>
              <div className="relative aspect-[16/7] w-full bg-neutral-100 overflow-hidden">
                <img
                  src={b.thumbnailUrl}
                  alt={b.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div
                  className="font-semibold mb-1 group-hover:text-pinkBtn transition-colors truncate"
                  style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                  title={b.title}
                >
                  {b.title}
                </div>
                <div className="text-xs text-neutral-500 mb-1 flex gap-2 items-center">
                  <span>{b.minutesRead} min read</span>
                  <span>•</span>
                  <span>{toDateSafe(b.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" })}</span>
                </div>
                <div className="text-xs text-neutral-700 line-clamp-2 opacity-80">
                  {b.excerpt}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
