// Blog sections
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import type { Blog } from "../types";

// Utils
function toDateSafe(val: any): Date {
  if (!val) return new Date(0);
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  if (typeof val === "object" && typeof val.toDate === "function") return val.toDate();
  if (typeof val === "object" && typeof val.seconds === "number") return new Date(val.seconds * 1000);
  return new Date(0);
}
const ts = (b: Blog) =>
  toDateSafe(b.publishedAt || b.updatedAt || b.createdAt || 0).getTime();

const stripTags = (s = "") =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const peek = (b: Blog, max = 120) => {
  const maybeExcerpt = (b as any)?.excerpt as string | undefined;
  if (maybeExcerpt && maybeExcerpt.trim()) return maybeExcerpt.trim();
  const txt = stripTags(b.html || "");
  return txt.length > max ? txt.slice(0, max) + "…" : txt;
};

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Shared fetch
export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  useEffect(() => {
    api.get<Blog[]>("/blogs").then((r) => setBlogs(r.data));
  }, []);
  return blogs;
}

// Top (5 random from all blogs; exclude featured if provided)
export function TopPicks({ excludeId }: { excludeId?: string }) {
  const blogs = useBlogs();

  const picks = useMemo(() => {
    if (!blogs?.length) return [];
  const pool = excludeId ? (Array.isArray(blogs) ? blogs : []).filter((b) => b._id !== excludeId) : (Array.isArray(blogs) ? blogs : []);
    const a = [...pool];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 5);
  }, [blogs, excludeId]);

  if (!picks.length) return null;

  return (
    <section className="container-wide my-10">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Top</h2>
        <div className="text-sm text-neutral-500">5 random picks</div>
      </div>

  {/* Horizontal strip with small rank badges */}
      <div className="mt-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-5 pr-2 py-1">
          {(Array.isArray(picks) ? picks : []).map((b, i) => (
            <Link
              key={b._id || b.id}
              to={`/blog/${b.slug}`}
              className="relative flex-shrink-0 w-[320px] md:w-[360px] rounded-2xl border bg-white overflow-hidden hover:shadow transition"
            >
              <div className="absolute top-2 left-2 z-10 h-7 px-2 rounded-full bg-pinkBtn text-white text-xs grid place-items-center shadow">
                #{i + 1}
              </div>

              {b.thumbnailUrl ? (
                <img
                  src={b.thumbnailUrl}
                  alt=""
                  className="w-full aspect-[16/9] object-cover"
                />
              ) : (
                <div className="w-full aspect-[16/9] bg-neutral-100 grid place-content-center text-neutral-400 text-xs">
                  No image
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">{b.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
                  {peek(b, 140)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Top Monthly: randomized, with sneak peek
export function TopMonthly() {
  const blogs = useBlogs();
  const top = useMemo(
  () => shuffle((Array.isArray(blogs) ? blogs : []).filter((b) => b.placement === "monthly")),
    [blogs]
  );

  if (top.length === 0) return null;

  return (
    <section className="container-wide my-10">
      <h2 className="text-2xl font-semibold mb-4">Monthly Top</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
  {(Array.isArray(top) ? top : []).map((b) => (
          <Link
            key={b._id || b.id}
            to={`/blog/${b.slug}`}
            className="rounded-2xl border bg-white overflow-hidden hover:shadow transition"
          >
            {b.thumbnailUrl && (
              <img
                src={b.thumbnailUrl}
                alt=""
                className="w-full aspect-[16/9] object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold line-clamp-2">{b.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
                {peek(b, 140)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Latest: all blogs, newest first
export function LatestBlogs() {
  const blogs = useBlogs();
  const latest = useMemo(() => [...blogs].sort((a, b) => ts(b) - ts(a)), [blogs]);

  if (latest.length === 0) return null;

  return (
    <section className="container-wide my-10">
      <h2 className="text-2xl font-semibold mb-4">Latest</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
  {(Array.isArray(latest) ? latest : []).map((b) => (
          <Link
            key={b._id || b.id}
            to={`/blog/${b.slug}`}
            className="rounded-2xl border bg-white overflow-hidden hover:shadow transition"
          >
            {b.thumbnailUrl && (
              <img
                src={b.thumbnailUrl}
                alt=""
                className="w-full aspect-[16/9] object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold line-clamp-2">{b.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                {peek(b, 90)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
