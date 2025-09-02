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

// Render a single blog row, optionally with ranking and category sneak peek
function Row({ b, index, showRank, showCategories, variant }: { b: Blog; index?: number; showRank?: boolean; showCategories?: boolean; variant?: 'top5' | 'latest' }) {
  // Style tweaks for different list types
  const isTop5 = variant === 'top5';
  const isLatest = variant === 'latest';
  return (
    <Link
      to={`/blog/${b.slug}`}
      className={`flex items-center gap-4 py-3 group hover:bg-neutral-50/40 rounded-xl transition-all relative ${isTop5 ? '' : isLatest ? 'border border-neutral-100 bg-transparent' : ''}`}
      style={{ minHeight: 64, background: 'transparent' }}
    >
      {showRank && (
        <span
          className={
            isTop5
              ? `font-black text-lg md:text-2xl w-8 text-center mr-1 ${index === 0 ? 'text-pink-500 scale-110 drop-shadow' : 'text-neutral-400'}`
              : isLatest
              ? 'font-bold text-base w-7 text-center mr-1 text-neutral-300 bg-white border border-neutral-200 rounded-full h-7 flex items-center justify-center shadow-sm'
              : ''
          }
          style={isTop5 ? { fontFamily: 'monospace' } : {}}
        >
          {index !== undefined ? index + 1 : ''}
        </span>
      )}
      <img
        src={b.thumbnailUrl}
        className={`h-14 w-14 rounded-lg object-cover border border-neutral-200 shadow-sm group-hover:scale-105 transition-transform ${isLatest ? 'opacity-95' : ''}`}
        alt={b.title}
      />
      <div className="min-w-0 flex-1">
        <div
          className={`leading-snug transition-colors ${isTop5 ? 'font-semibold group-hover:text-pinkBtn' : isLatest ? 'font-medium group-hover:text-neutral-700' : ''}`}
          style={{
            fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            display: 'block',
          }}
          title={b.title}
        >
          {b.title}
        </div>
        <div className="mt-1 text-xs text-neutral-500 flex gap-3 items-center">
          <span>{b.minutesRead} min read</span>
          <span>•</span>
          <span>
            {toDateSafe(b.publishedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "2-digit",
            })}
          </span>
          {showCategories && b.categories && b.categories.length > 0 && (
            <>
              <span>•</span>
              <span className="flex gap-1">
                {b.categories.slice(0, 2).map((cat: string) => (
                  <span
                    key={cat}
                    className={
                      isTop5
                        ? 'bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border border-pink-200 shadow-sm'
                        : isLatest
                        ? 'bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border border-neutral-300 shadow-sm'
                        : ''
                    }
                  >
                    {cat}
                  </span>
                ))}
                {b.categories.length > 2 && <span className="text-neutral-400">+{b.categories.length - 2}</span>}
              </span>
            </>
          )}
        </div>
      </div>
      <span className={`text-neutral-300 group-hover:text-pink-300 text-xl font-bold transition-colors ${isLatest ? 'opacity-60' : ''}`}>→</span>
    </Link>
  );
}

// Placeholder row for loading
function PlaceholderRow({ fadeIn }: { fadeIn?: boolean }) {
  return (
    <div className="flex items-start gap-4 py-3">
      <div className={`h-14 w-14 rounded-lg skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
      <div className="min-w-0 flex-1">
        <div className={`h-4 w-3/4 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
        <div className={`mt-2 h-3 w-1/2 rounded skeleton${fadeIn ? ' skeleton-fadein' : ''}`} />
      </div>
      <span className="text-neutral-200">…</span>
    </div>
  );
}

export function ListBlock({
  title,
  items,
  placeholderCount = 0,
  skeletonFadeIn = false,
  startIndex = 0,
}: {
  title: string;
  items: Blog[];
  placeholderCount?: number;
  skeletonFadeIn?: boolean;
  startIndex?: number;
}) {
  // Detect if this is the Top 5 Monthly list
  const isTop5Monthly = title.toLowerCase().includes("top 5 monthly");
  const isLatest = title.toLowerCase().includes('latest');
  return (
    <div>
      <h3 className="h2 mb-4 tracking-tight flex items-center gap-2">
        {title}
      </h3>
      <div className="divide-y">
        {items.map((b, i) => (
          <Row
            key={b._id || b.id}
            b={b}
            index={isTop5Monthly ? i : isLatest ? i + (startIndex ?? 0) : undefined}
            showRank={isTop5Monthly || isLatest}
            showCategories={isTop5Monthly || isLatest}
            variant={isTop5Monthly ? 'top5' : isLatest ? 'latest' : undefined}
          />
        ))}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <PlaceholderRow key={`ph-${i}`} fadeIn={skeletonFadeIn} />
        ))}
      </div>
    </div>
  );
}
