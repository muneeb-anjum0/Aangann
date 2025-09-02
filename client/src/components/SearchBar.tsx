import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";


export default function SearchBar({ onSearch }:{ onSearch:(q:string)=>void }) {
  const [q, setQ] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show recent blogs dropdown
  useEffect(() => {
    if (showDropdown) {
      try {
        const arr = JSON.parse(localStorage.getItem("recentBlogs") || "[]");
        setRecentBlogs(Array.isArray(arr) ? arr : []);
      } catch {
        setRecentBlogs([]);
      }
    }
  }, [showDropdown]);

  // Ensure recentBlogs is always an array
  useEffect(() => {
    if (!Array.isArray(recentBlogs)) setRecentBlogs([]);
  }, [recentBlogs]);

  // Hide dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showDropdown) return;
    function onClick(e: MouseEvent) {
      if (!inputRef.current || !dropdownRef.current) return;
  // Close dropdown if click is outside
      if (
        !inputRef.current.contains(e.target as Node) &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showDropdown]);

  // Filter recent blogs by query
  const filteredRecent = q.trim()
    ? recentBlogs.filter(b => b.title.toLowerCase().includes(q.trim().toLowerCase()))
    : recentBlogs;

  return (
    <div className="bg-transparent pt-0 pb-2 text-center">
      <h2 className="h2">Discover our Latest Blogs</h2>
      <p className="mt-1 text-neutral-600">
        Explore trusted answers, desi wisdom, and expert tips, right at your fingertips.
      </p>
      <div className="mx-auto mt-2 flex max-w-2xl px-4 relative justify-center">
        <div className="inline-flex rounded-full border border-pink-300 overflow-hidden bg-white/60 shadow-sm w-full max-w-xl">
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search Blogs"
            className="px-4 py-2 text-base font-medium bg-transparent outline-none border-0 focus:ring-0 w-full min-w-0"
            autoComplete="off"
            style={{ borderRadius: 0 }}
          />
          <button
            onClick={() => { onSearch(q); setShowDropdown(false); }}
            className="px-5 py-2 font-semibold text-base transition-all duration-150 bg-pink-100 text-pink-700 hover:bg-pink-200 border-0 rounded-none"
            style={{ borderRadius: 0 }}
          >
            Search
          </button>
        </div>
        {/* Dropdown with recent blogs */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-2 bg-white border rounded-xl shadow-lg z-20 text-left max-h-80 overflow-auto"
          >
            {filteredRecent.length > 0 ? (
              <>
                <div className="px-4 pt-3 pb-1 text-xs text-neutral-500 font-semibold">Recent Blogs</div>
                {filteredRecent.map(b => (
                  <Link
                    to={`/blog/${b.slug}`}
                    key={b._id}
                    className="block px-4 py-2 hover:bg-pink-50 transition font-medium truncate"
                  >
                    {b.title}
                  </Link>
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-neutral-400 text-sm">No recent blogs</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
