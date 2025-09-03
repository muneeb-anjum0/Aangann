// Admin dashboard page
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import api from "../lib/api";
import type { Blog } from "../types";
import { Editor } from "@tinymce/tinymce-react";
import Cropper from "react-easy-crop";
import classNames from "classnames";
import logo from "../assets/logo.svg";

const TINYMCE_API_KEY = "zt0p31tqiog8sufsctkfc6behjl6rtuiua1n4pnf8tesr2t1";
const FEATURED_MAX = 1;
const MONTHLY_MAX = 5;

type User = { id: string; email: string; role: string };
type Tab = "dashboard" | "blogs" | "new" | "edit" | "sort";

// Mini Modal
function MiniModal({
  open,
  title,
  message,
  kind = "success",
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  kind?: "success" | "error" | "info";
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-[min(92vw,520px)] p-5 rounded-2xl shadow-xl bg-white">
        <div className="flex items-center gap-3">
          <span
            className={classNames(
              "inline-grid h-8 w-8 place-items-center rounded-full text-white",
              kind === "success" && "bg-emerald-500",
              kind === "error" && "bg-rose-500",
              kind === "info" && "bg-sky-500"
            )}
          >
            {kind === "success" ? "✓" : kind === "error" ? "!" : "i"}
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="mt-3 text-neutral-700">{message}</p>
        <div className="mt-5 flex justify-end">
          <button className="btn-liquid btn-liquid--brand" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [me, setMe] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editing, setEditing] = useState<Blog | null>(null);

  // Logout function
  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem('authToken');
    location.reload();
  };

  useEffect(() => {
    // Only try to authenticate if we have a token
    const token = localStorage.getItem('authToken');
    if (token) {
      api.get<User>("/auth/me").then(r => setMe(r.data)).catch(() => {
        // Token invalid, remove it
        localStorage.removeItem('authToken');
        setMe(null);
      });
    } else {
      setMe(null);
    }
  }, []);

  if (!me) return (
    <AnimatePresence mode="wait">
      <Login key="login" onAuthed={u => setMe(u)} />
    </AnimatePresence>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="admin-dashboard"
        className="min-h-screen"
        initial={{ opacity: 0, scale: 0.98, y: 40, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.98, y: 40, filter: "blur(12px)" }}
        transition={{ type: "spring", duration: 1, bounce: 0.35 }}
      >
        <NavBar tab={tab} setTab={setTab} onLogout={logout} />
        <div className="container-wide py-6">
          {tab === "dashboard" && <DashboardPanel />}
          {tab === "blogs" && (
            <BlogsList onEdit={(b) => { setEditing(b); setTab("edit"); }} />
          )}
          {tab === "new" && <EditorPanel key="new" mode="create" setTab={setTab} setEditing={setEditing} />}
          {tab === "edit" && editing && <EditorPanel key={editing.id} mode="edit" initial={editing} setTab={setTab} setEditing={setEditing} />}
          {tab === "sort" && <SortPanel />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Navbar
const NAV_TABS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "blogs", label: "Blogs" },
  { key: "new", label: "Upload New" },
  { key: "sort", label: "Sort" }
];

function NavBar({ tab, setTab, onLogout }: { tab: Tab; setTab: (t: Tab) => void; onLogout: () => void }) {
  return (
    <header className="w-full bg-transparent z-30">
      <div className="container-wide py-3">
        <div className="rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur flex items-center gap-4 px-4 h-16">
          {/* Brand */}
          <button onClick={() => setTab("dashboard")} className="group flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/80 border border-white/60 shadow grid place-content-center overflow-hidden h-11 w-11">
              <img src={logo} alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <div className="text-lg font-bold tracking-tight text-neutral-800">Admin</div>
          </button>

          {/* Center nav */}
          <nav className="flex-1 flex justify-center">
            <div className="relative tab-rail rounded-xl">
              <div className="flex gap-1">
                {(Array.isArray(NAV_TABS) ? NAV_TABS : []).map(ti => (
                  <button
                    key={ti.key}
                    onClick={() => setTab(ti.key)}
                    className={classNames(
                      "btn-tab px-5 h-10 rounded-lg text-base font-medium transition-all duration-150 relative",
                      tab === ti.key
                        ? "is-active text-pink-800 font-bold bg-gradient-to-tr from-pink-100 via-pink-200 to-orange-100 shadow-md scale-105 z-10 transition-all duration-150"
                        : "is-idle text-neutral-600 hover:bg-pink-50/60 hover:text-pink-700"
                    )}
                    style={tab === ti.key ? {
                      background: "linear-gradient(120deg, #fce7f3 0%, #fbcfe8 60%, #ffedd5 100%)",
                      boxShadow: "0 2px 12px 0 #fbcfe8cc",
                      border: "none",
                      outline: "none"
                    } : {}}
                  >
                    {ti.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a href="/" className="flex items-center gap-2 bg-white text-pink-700 border border-pink-200 rounded-xl px-4 py-2 font-semibold transition-all duration-150 hover:bg-pink-50 hover:text-pink-900 disabled:opacity-60">Website</a>
            <button onClick={onLogout} className="flex items-center gap-2 bg-pink-200 text-pink-800 border border-pink-300 rounded-xl px-4 py-2 font-semibold transition-all duration-150 hover:bg-pink-300 hover:text-pink-900 disabled:opacity-60">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Dashboard (re-arranged, month/year toggle)
function DashboardPanel() {
  const [list, setList] = useState<Blog[]>([]);
  const [featured, setFeatured] = useState<Blog | null>(null);
  // Only monthly mode
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const items = await api.get<Blog[]>("/blogs").then(r => {
        console.log("API /blogs response (Admin Dashboard)", r.data);
        return Array.isArray(r.data) ? r.data : [];
      });
      setList(Array.isArray(items) ? items : []);
      const sec = await api.get<{ featured?: Blog }>("/blogs/sections").then(r => r.data);
      setFeatured(sec.featured || null);
      setLoading(false);
    })();
  }, []);

  // Convert Firestore Timestamp or string/Date to JS Date
  const toDate = (val: any): Date => {
    if (!val) return new Date(0);
    if (val instanceof Date) return val;
    if (typeof val === "string" || typeof val === "number") return new Date(val);
    if (typeof val === "object" && typeof val.toDate === "function") return val.toDate();
    if (typeof val === "object" && val.seconds !== undefined) return new Date(val.seconds * 1000);
    return new Date(val);
  };

  // Only consider as latest update if blog was created or edited
  const getDate = (b: Blog) => {
  // If updatedAt and createdAt are the same, treat as creation
    const updated = toDate(b.updatedAt);
    const created = toDate(b.createdAt);
  // If updatedAt is within 2 seconds of createdAt, treat as creation
    if (Math.abs(updated.getTime() - created.getTime()) < 2000) return created;
    return updated;
  };

  const {
    total,
    latestDate,
    avgMinutes,
    uniqueCategories,
    monthlyTopCount,
  monthCounts, // Per-day counts for current month
    currentYear, currentMonth,
    topCategories,
  } = useMemo(() => {
    const total = list.length;

    const sorted = [...list].sort((a, b) => getDate(b).getTime() - getDate(a).getTime());
    const latestDate = sorted[0] ? getDate(sorted[0]) : null;

    const minutes = (Array.isArray(list) ? list : []).map((b: any) => Number(b.minutesRead) || 0);
    const avgMinutes = minutes.length
      ? Math.round((minutes.reduce((a, c) => a + c, 0) / minutes.length) * 10) / 10
      : 0;

  // Categories
    const categoryMap = new Map<string, number>();
    list.forEach((b: any) => {
      const cats: string[] = Array.isArray(b.categories) ? b.categories : [];
      cats.forEach(c => {
        const key = String(c || "").trim();
        if (!key) return;
        categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
      });
    });
    const uniqueCategories = categoryMap.size;

    const monthlyTopCount = list.filter((b: any) => b.placement === "monthly").length;

  // Per-day this month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthCounts = Array.from({ length: daysInMonth }, () => 0);
    list.forEach(b => {
      const d = getDate(b);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
  const day = d.getDate(); // 1..n
        monthCounts[day - 1] += 1;
      }
    });

    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      total,
      latestDate,
      avgMinutes,
      uniqueCategories,
      monthlyTopCount,
      monthCounts,
      currentYear, currentMonth,
      topCategories,
    };
  }, [list]);

  if (loading) {
  // Glassy skeleton loader (matches loaded dashboard sizes)
    return (
      <div className="space-y-6 animate-pulse">
  {/* Top 4 KPI cards */}
        <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] gap-3 md:grid-flow-row md:grid-cols-2 xl:grid-cols-4 md:gap-4 md:overflow-visible">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[180px] rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur p-5 flex flex-col items-start h-[92px]">
              <div className="h-3 w-20 rounded bg-white/60 mb-3" />
              <div className="h-8 w-16 rounded bg-white/70" />
            </div>
          ))}
        </div>
  {/* Featured & Latest Update cards */}
        <div className="grid grid-cols-12 gap-6">
          <div className="rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur p-5 flex flex-col gap-2 min-h-[90px] col-span-12 md:col-span-8">
            <div className="h-3 w-24 rounded bg-white/60 mb-2" />
            <div className="h-7 w-40 rounded bg-white/70" />
          </div>
          <div className="rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur p-5 flex flex-col gap-2 min-h-[90px] col-span-12 md:col-span-4">
            <div className="h-3 w-24 rounded bg-white/60 mb-2" />
            <div className="h-7 w-32 rounded bg-white/70" />
          </div>
        </div>
  {/* Calendar & Top Categories cards */}
        <div className="grid grid-cols-12 gap-6">
          <div className="rounded-2xl bg-white/60 border border-white/50 shadow-lg backdrop-blur p-4 col-span-12 lg:col-span-8 flex flex-col justify-center min-h-[370px]">
            <div className="h-5 w-32 rounded bg-white/70 mb-4" />
            <div className="flex-1 w-full rounded-xl bg-white/50" />
          </div>
          <div className="rounded-2xl bg-white/50 border border-white/30 shadow backdrop-blur p-4 flex flex-col gap-3 min-h-[480px] col-span-12 lg:col-span-4" />
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-6">
  {/* Animated dashboard */}
      <motion.div
        className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] gap-3 overflow-x-auto no-scrollbar md:grid-flow-row md:grid-cols-2 xl:grid-cols-4 md:gap-4 md:overflow-visible"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.13 } },
        }}
      >
  {[{ title: "Total Blogs", value: total }, { title: "Avg Read (min)", value: avgMinutes }, { title: "Categories", value: uniqueCategories }, { title: "Monthly Top", value: monthlyTopCount }].map((kpi) => (
          <motion.div
            key={kpi.title}
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, type: "spring", bounce: 0.3 } },
            }}
            className=""
          >
            <KPIStyled title={kpi.title} value={kpi.value} />
          </motion.div>
        ))}
      </motion.div>
  {/* Rest of animated dashboard code */}
      <motion.div
        className="grid grid-cols-12 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        <motion.div
          className="col-span-12 md:col-span-8"
          variants={{
            hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, type: "spring", bounce: 0.3 } },
          }}
        >
          <div className="rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur p-5 flex flex-col gap-2 min-h-[90px]">
            <div className="text-sm text-neutral-600 mb-1 font-medium tracking-wide">Featured</div>
            {featured ? (
              <div className="flex items-center gap-3 min-h-[2.2rem]">
                <span className="font-bold truncate max-w-[70%] text-lg text-neutral-800" title={featured.title}>{featured.title}</span>
                {featured.updatedAt && (
                  <span className="ml-auto px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold whitespace-nowrap shadow-sm border border-pink-200/60">
                    {(() => {
                      const d = toDate(featured.updatedAt || featured.createdAt || featured.publishedAt);
                      if (isNaN(d.getTime())) return "—";
                      // Format: 8th September 2025 | 08:24pm
                      const day = d.getDate();
                      const month = d.toLocaleString('default', { month: 'long' });
                      const year = d.getFullYear();
                      const getOrdinal = (n: number) => {
                        if (n > 3 && n < 21) return 'th';
                        switch (n % 10) {
                          case 1: return 'st';
                          case 2: return 'nd';
                          case 3: return 'rd';
                          default: return 'th';
                        }
                      };
                      let hours = d.getHours();
                      const minutes = d.getMinutes().toString().padStart(2, '0');
                      const ampm = hours >= 12 ? 'pm' : 'am';
                      hours = hours % 12;
                      if (hours === 0) hours = 12;
                      const hourStr = hours.toString().padStart(2, '0');
                      return `${day}${getOrdinal(day)} ${month} ${year} | ${hourStr}:${minutes}${ampm}`;
                    })()}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-neutral-400">None</span>
            )}
          </div>
        </motion.div>
        <motion.div
          className="col-span-12 md:col-span-4"
          variants={{
            hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, type: "spring", bounce: 0.3 } },
          }}
        >
          <div className="rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur p-5 flex flex-col gap-2 min-h-[90px]">
            <div className="text-sm text-neutral-600 mb-1 font-medium tracking-wide">Latest Update</div>
            <div className="flex items-center gap-3 min-h-[2.2rem]">
              {latestDate ? (
                <span className="ml-auto px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold whitespace-nowrap shadow-sm border border-pink-200/60">
                  {(() => {
                    const d = latestDate;
                    if (isNaN(d.getTime())) return "—";
                    // Format: 8th September 2025 | 08:24pm
                    const day = d.getDate();
                    const month = d.toLocaleString('default', { month: 'long' });
                    const year = d.getFullYear();
                    const getOrdinal = (n: number) => {
                      if (n > 3 && n < 21) return 'th';
                      switch (n % 10) {
                        case 1: return 'st';
                        case 2: return 'nd';
                        case 3: return 'rd';
                        default: return 'th';
                      }
                    };
                    let hours = d.getHours();
                    const minutes = d.getMinutes().toString().padStart(2, '0');
                    const ampm = hours >= 12 ? 'pm' : 'am';
                    hours = hours % 12;
                    if (hours === 0) hours = 12;
                    const hourStr = hours.toString().padStart(2, '0');
                    return `${day}${getOrdinal(day)} ${month} ${year} | ${hourStr}:${minutes}${ampm}`;
                  })()}
                </span>
              ) : (
                <span className="text-neutral-400">—</span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        className="grid grid-cols-12 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        <motion.div
          className="panel-glass col-span-12 lg:col-span-8"
          variants={{
            hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, type: "spring", bounce: 0.3 } },
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {`Activity Calendar — ${new Date(currentYear, currentMonth).toLocaleString(undefined, { month: "long", year: "numeric" })}`}
            </h3>
          </div>
          <div className="mt-4">
            <MonthHeatmap
              year={currentYear}
              month={currentMonth}
              counts={monthCounts}
            />
          </div>
        </motion.div>
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ type: 'spring', duration: 1, bounce: 0.35 }}
        >
          <div className="rounded-2xl bg-white/50 border border-white/30 shadow backdrop-blur p-4 flex flex-col gap-3 min-h-[480px] justify-between">
            <h3 className="text-base font-semibold mb-1 text-neutral-700">Top Categories</h3>
            <div className="flex-1 flex flex-col divide-y divide-neutral-200/70 mt-1">
              {topCategories.length === 0 && <div className="text-xs text-neutral-400">No categories yet.</div>}
              {(Array.isArray(topCategories) ? topCategories : []).map(([name, count]) => (
                <MinimalCategoryRow key={name} label={name} value={count} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Month Calendar Heatmap
function MonthHeatmap({ year, month, counts }: { year: number; month: number; counts: number[] }) {
  const daysInMonth = counts.length;
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const blanks = Array.from({ length: firstDayOfWeek }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells = [...blanks, ...days];
  // (max unused)

  return (
    <div className="bg-white/60 border border-white/50 rounded-2xl p-4 backdrop-blur shadow-xl">
  {/* Weekday headings */}
      <div className="grid grid-cols-7 gap-2 text-xs text-neutral-500 px-1 mb-2 font-semibold tracking-wide">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, idx) => {
          if (d === null) return <div key={idx} className="h-10 rounded-xl bg-transparent" />;
          const c = counts[d - 1] || 0;
          return (
            <div
              key={idx}
              className={
                `relative h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border border-white/60 bg-white/80 hover:bg-pink-100/80 group ${c > 0 ? "shadow-lg" : ""}`
              }
              title={`${new Date(year, month, d).toLocaleDateString()} — ${c} post${c !== 1 ? "s" : ""}`}
            >
              <span className="text-[13px] text-neutral-700 font-medium mb-1">{d}</span>
              {c > 0 && (
                <span className="flex items-center gap-1">
                  {Array.from({ length: Math.min(c, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, #ec4899 60%, #f472b6 100%)`,
                        opacity: 0.6 + 0.4 * (i / Math.max(1, c - 1)),
                        boxShadow: "0 0 4px #ec4899aa"
                      }}
                    />
                  ))}
                  {c > 3 && <span className="text-xs text-pink-500 font-bold ml-1">+{c - 3}</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>
  {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-neutral-600">
        <span>Less</span>
        <span className="inline-block w-3 h-3 rounded-full bg-pink-200/60" />
        <span className="inline-block w-3 h-3 rounded-full bg-pink-400/80" />
        <span className="inline-block w-3 h-3 rounded-full bg-pink-600/90" />
        <span>More</span>
      </div>
    </div>
  );
}

/* ----- KPI ----- */

// Redesigned KPI card with glassmorphism and modern style
function KPIStyled({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="min-w-[180px] rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur p-5 flex flex-col items-start transition-all duration-200 hover:shadow-xl hover:bg-white/80 cursor-pointer">
      <div className="text-xs font-medium text-neutral-600 tracking-wide mb-1 uppercase">{title}</div>
      <div className="text-3xl font-bold text-neutral-800 tabular-nums leading-tight">{value}</div>
    </div>
  );
}


/* ----- HBar (Top Categories) ----- */





// Minimalistic category row (no bars)
function MinimalCategoryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <span className="truncate max-w-[60%] text-base text-neutral-700">{label}</span>
      <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-sm font-medium tabular-nums min-w-[2.5rem] text-center">
        {value}
      </span>
    </div>
  );
}

/* ---------------- Blogs List ---------------- */
function BlogsList({ onEdit }: { onEdit: (b: Blog) => void }) {
  // Helper to convert Firestore Timestamp or string/Date to JS Date
  const toDate = (val: any): Date => {
    if (!val) return new Date(0);
    if (val instanceof Date) return val;
    if (typeof val === "string" || typeof val === "number") return new Date(val);
    // Firestore Timestamp object (has toDate method)
    if (typeof val === "object" && typeof val.toDate === "function") return val.toDate();
    if (typeof val === "object" && val.seconds !== undefined) return new Date(val.seconds * 1000);
    return new Date(val);
  };
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [del, setDel] = useState<{ open: boolean; id?: string; title?: string; loading?: boolean; error?: string }>({ open: false });

  useEffect(() => {
    setLoading(true);
    api.get<Blog[]>("/blogs").then(r => r.data).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="blogs-skeleton"
            className="rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur overflow-hidden animate-pulse"
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="bg-white/60 h-12 w-full" />
            <div className="divide-y divide-white/60">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center h-12 px-4 gap-4">
                  <div className="h-4 w-1/4 rounded bg-white/70" />
                  <div className="h-4 w-1/6 rounded bg-white/60" />
                  <div className="h-4 w-1/6 rounded bg-white/60" />
                  <div className="h-4 w-1/6 rounded bg-white/50" />
                  <div className="h-8 w-16 rounded bg-white/70 ml-auto" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="blogs-table"
            className="rounded-2xl bg-white/60 border border-white/30 shadow-lg backdrop-blur overflow-hidden"
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: '38%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead className="bg-white/60">
                <tr>
                  <th className="text-left p-3">Title</th>
                  <th className="text-center p-3">Featured</th>
                  <th className="text-center p-3">Placement</th>
                  <th className="text-center p-3">Updated</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {(Array.isArray(items) ? items : []).map(b => (
                  <tr key={b.id} className="bg-white/40">
                    <td className="p-3 font-medium text-neutral-800 whitespace-normal break-words">{b.title}</td>
                    <td className="p-3 text-center">{(b as any).isFeatured ? <span className="chip chip-emerald">Yes</span> : <span className="text-neutral-500 text-xs">No</span>}</td>
                    <td className="p-3 text-center">{(b as any).placement || "none"}</td>
                    <td className="p-3 text-center">{
                      (() => {
                        // Prefer updatedAt, then createdAt, then publishedAt
                        const dateVal = (b as any).updatedAt || (b as any).createdAt || (b as any).publishedAt;
                        const d = toDate(dateVal);
                        if (isNaN(d.getTime())) return <span className="text-neutral-500">—</span>;
                        // Format: 8th September 2025 | 08:24pm
                        const day = d.getDate();
                        const month = d.toLocaleString('default', { month: 'long' });
                        const year = d.getFullYear();
                        const getOrdinal = (n: number) => {
                          if (n > 3 && n < 21) return 'th';
                          switch (n % 10) {
                            case 1: return 'st';
                            case 2: return 'nd';
                            case 3: return 'rd';
                            default: return 'th';
                          }
                        };
                        let hours = d.getHours();
                        const minutes = d.getMinutes().toString().padStart(2, '0');
                        const ampm = hours >= 12 ? 'pm' : 'am';
                        hours = hours % 12;
                        if (hours === 0) hours = 12;
                        const hourStr = hours.toString().padStart(2, '0');
                        return `${day}${getOrdinal(day)} ${month} ${year} | ${hourStr}:${minutes}${ampm}`;
                      })()
                    }</td>
                    <td className="p-3 text-center">
                      <button
                        className="btn-liquid btn-liquid--ghost"
                        onClick={async () => onEdit(await api.get<Blog>(`/blogs/${b.id}`).then(r => r.data))}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-2 rounded bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors px-3 py-1 text-sm font-medium border border-rose-200/60 shadow-sm"
                        onClick={() => setDel({ open: true, id: b.id, title: b.title, loading: false, error: "" })}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td className="p-6 text-center text-neutral-500" colSpan={5}>No blogs yet.</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {del.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDel({ open: false })} />
          <div className="relative bg-white w-[min(92vw,520px)] p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold">Delete blog?</h3>
            <p className="mt-2 text-neutral-600">This will permanently delete <span className="font-medium">“{del.title}”</span>.</p>
            {del.error && <p className="mt-2 text-sm text-rose-600">{del.error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-liquid btn-liquid--ghost" disabled={del.loading} onClick={() => setDel({ open: false })}>
                Cancel
              </button>
              <button
                className="btn-liquid btn-liquid--danger"
                disabled={del.loading}
                onClick={async () => {
                  setDel(prev => ({ ...prev, loading: true, error: "" }));
                  try {
                    await api.delete(`/blogs/${del.id}`);
                    setItems(prev => prev.filter(it => (it as any).id !== del.id));
                    setDel({ open: false });
                    // Optionally, refresh from server to ensure sync
                    const blogs = await api.get<Blog[]>("/blogs").then(r => r.data);
                    setItems(blogs);
                  } catch (e: any) {
                    setDel(prev => ({ ...prev, loading: false, error: e?.response?.data?.message || "Failed to delete." }));
                  }
                }}
              >
                {del.loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Sort Panel ---------------- */
function SortPanel() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [qFeat, setQFeat] = useState("");
  const [qMon, setQMon] = useState("");

  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [monthlyIds, setMonthlyIds] = useState<Set<string>>(new Set());
  // Maintain explicit order for selected monthly blogs
  const [monthlyOrder, setMonthlyOrder] = useState<string[]>([]);

  const featRef = useRef<HTMLDivElement>(null);
  const monRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await api.get<Blog[]>("/blogs").then(r => r.data);
      setItems(list);
      setFeaturedId(list.find((b: any) => b.isFeatured)?.id || null);
      const selected = (Array.isArray(list) ? list : []).filter((b: any) => b.placement === "monthly");
      setMonthlyIds(new Set(selected.map((b: any) => b.id)));
      // Try to get order from first selected monthly blog
      if (selected.length > 0 && Array.isArray(selected[0].monthlyOrder) && selected[0].monthlyOrder.length > 0) {
        setMonthlyOrder(selected[0].monthlyOrder.filter((id: string) => selected.some((b: any) => b.id === id)));
      } else {
        setMonthlyOrder(selected.map((b: any) => b.id));
      }
      setLoading(false);
    })();
  }, []);

  const normalized = (b: Blog) => new Date((b as any).publishedAt || (b as any).updatedAt || (b as any).createdAt).getTime();

  const featList = useMemo(() => {
    const arr = (Array.isArray(items) ? items : []).filter(b => b.title && b.title.toLowerCase().includes(qFeat.trim().toLowerCase()));
    arr.sort((a, b) => {
      const sa = (a as any).id === featuredId ? 1 : 0;
      const sb = (b as any).id === featuredId ? 1 : 0;
      if (sb - sa !== 0) return sb - sa;
      return normalized(b) - normalized(a);
    });
    return arr;
  }, [items, qFeat, featuredId]);

  // Show selected monthly blogs in order, then unselected
  const monList = useMemo(() => {
    const arr = (Array.isArray(items) ? items : []).filter(b => b.title && b.title.toLowerCase().includes(qMon.trim().toLowerCase()));
    // Put selected monthly blogs in order, then others
    const selected = monthlyOrder.map(id => arr.find(b => b.id === id)).filter(Boolean);
    const unselected = arr.filter(b => !monthlyOrder.includes(b.id));
    return [...selected, ...unselected];
  }, [items, qMon, monthlyIds, monthlyOrder]);

  const monthlyCount = monthlyIds.size;

  // Styled badge for monthly count
  const MonthlyCountBadge = () => (
    <span className={classNames(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
      monthlyCount > MONTHLY_MAX ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-pink-100 text-pink-700 border border-pink-200"
    )}>
      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {monthlyCount} selected
    </span>
  );

  const pickFeatured = (id: string) => {
    setFeaturedId(id);
    featRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    // Only allow one featured, so remove isFeatured from all others
  setItems(prev => (Array.isArray(prev) ? prev : []).map(b => ({ ...b, isFeatured: b.id === id })));
  };

  const toggleMonthly = (id: string) => {
    const next = new Set(monthlyIds);
    let nextOrder = [...monthlyOrder];
    if (next.has(id)) {
      next.delete(id);
      nextOrder = nextOrder.filter(x => x !== id);
    } else {
      if (next.size >= MONTHLY_MAX) return;
      next.add(id);
      nextOrder.push(id);
    }
    setMonthlyIds(next);
    setMonthlyOrder(nextOrder);
    monRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    // Update placement in items state for UI feedback
    setItems(prev => (Array.isArray(prev) ? prev : []).map(b => ({ ...b, placement: next.has(b.id) ? "monthly" : "latest" })));
  };

  const save = async () => {
    setSaving(true);
    try {
      const updates: Promise<any>[] = [];
      let firstMonthly = null;
      for (const b of items) {
        const id = b.id;
        // Only one featured, only selected monthly, all others reset
        const wantFeatured = id === featuredId;
        const wantPlacement = monthlyIds.has(id) ? "monthly" : "latest";
        // Only send monthlyOrder with the first selected monthly blog
        if (firstMonthly === null && wantPlacement === "monthly") {
          firstMonthly = id;
          updates.push(api.put(`/blogs/${id}/placement`, { isFeatured: wantFeatured, placement: wantPlacement, monthlyOrder }));
        } else {
          updates.push(api.put(`/blogs/${id}/placement`, { isFeatured: wantFeatured, placement: wantPlacement }));
        }
      }
      await Promise.all(updates);
      // Refresh items after save
      const list = await api.get<Blog[]>("/blogs").then(r => r.data);
      setItems(list);
      setFeaturedId(list.find((b: any) => b.isFeatured)?.id || null);
      const selected = (Array.isArray(list) ? list : []).filter((b: any) => b.placement === "monthly");
      setMonthlyIds(new Set(selected.map((b: any) => b.id)));
      if (selected.length > 0 && Array.isArray(selected[0].monthlyOrder) && selected[0].monthlyOrder.length > 0) {
        setMonthlyOrder(selected[0].monthlyOrder.filter((id: string) => selected.some((b: any) => b.id === id)));
      } else {
        setMonthlyOrder(selected.map((b: any) => b.id));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Featured Skeleton */}
      <div className="panel-glass overflow-hidden flex flex-col animate-pulse" style={{ height: 500 }}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
          <div className="h-5 w-32 bg-white/70 rounded" />
          <div className="h-4 w-20 bg-white/50 rounded" />
        </div>
        <div className="flex flex-col flex-1 min-h-0 px-4 pt-4 pb-4 space-y-2">
          <div className="h-9 w-full bg-white/60 rounded mb-3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-xl bg-white/60">
              <div className="h-5 w-5 bg-white/80 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-white/80 rounded mb-1" />
                <div className="h-3 w-24 bg-white/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Monthly Top Skeleton */}
      <div className="panel-glass overflow-hidden flex flex-col animate-pulse" style={{ height: 500 }}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
          <div className="h-5 w-40 bg-white/70 rounded" />
          <div className="h-4 w-24 bg-white/50 rounded" />
        </div>
        <div className="flex flex-col flex-1 min-h-0 px-4 pt-4 pb-4 space-y-2">
          <div className="h-9 w-full bg-white/60 rounded mb-3" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-xl bg-white/60">
              <div className="h-5 w-5 bg-white/80 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-white/80 rounded mb-1" />
                <div className="h-3 w-24 bg-white/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ type: "spring", duration: 0.7 }}>
  {/* Removed Sort title and info as requested */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured */}
  <motion.div className="panel-glass overflow-hidden flex flex-col" style={{ height: 500 }} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", duration: 0.7 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
            <div className="font-medium">Featured (pick {FEATURED_MAX})</div>
            <div className="text-xs text-neutral-600">{featuredId ? "Selected" : "None selected"}</div>
          </div>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 pt-4 shrink-0">
              <input value={qFeat} onChange={(e) => setQFeat(e.target.value)} placeholder="Search blogs…" className="input-glass mb-3" />
            </div>
            <div ref={featRef} className="flex-1 min-h-0 overflow-auto scrollbar-none space-y-2 px-4 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <AnimatePresence>
                {(Array.isArray(featList) ? featList : []).map((b: any) => {
                  const checked = featuredId === b.id;
                  return (
                    <motion.label
                      key={b.id}
                      className={classNames(
                        "flex items-center gap-3 py-2 px-2 rounded-xl transition-all cursor-pointer",
                        checked ? "glow-green" : "bg-white/70 hover:bg-white"
                      )}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <input type="radio" name="featured" checked={checked} onChange={() => pickFeatured(b.id)} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{b.title}</div>
                        <div className="text-xs text-neutral-500">
                          {Array.isArray(b.categories) && b.categories.length > 0 ? b.categories.join(', ') : 'Uncategorized'}
                          {typeof b.minutesRead === 'number' ? ` • ${b.minutesRead} min read` : ''}
                        </div>
                      </div>
                    </motion.label>
                  );
                })}
              </AnimatePresence>
              {featList.length === 0 && <motion.div className="text-sm text-neutral-500 py-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>No matches.</motion.div>}
            </div>
          </div>
        </motion.div>

        {/* Monthly Top */}
  <motion.div className="panel-glass overflow-hidden flex flex-col" style={{ height: 500 }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", duration: 0.7 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
            <div className="font-medium">Monthly Top (up to {MONTHLY_MAX})</div>
            <div className="text-xs flex items-center gap-2">
              <MonthlyCountBadge />
              <span className="text-neutral-400">/ {MONTHLY_MAX} max</span>
            </div>
          </div>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 pt-4 shrink-0">
              <input value={qMon} onChange={(e) => setQMon(e.target.value)} placeholder="Search blogs…" className="input-glass mb-3" />
            </div>
            <Reorder.Group
              axis="y"
              values={monthlyOrder}
              onReorder={setMonthlyOrder}
              ref={monRef}
              className="flex-1 min-h-0 overflow-auto scrollbar-none space-y-2 px-4 pb-4"
              as="div"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence>
                {(Array.isArray(monList) ? monList : []).map((b: any, idx: number) => {
                  const checked = monthlyIds.has(b.id);
                  const disabled = !checked && monthlyIds.size >= MONTHLY_MAX;
                  const isSelected = checked && monthlyOrder.includes(b.id);
                  return (
                    <Reorder.Item
                      key={b.id}
                      value={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="flex items-center gap-2"
                      style={{ zIndex: 1 }}
                    >
                      <label
                        className={classNames(
                          "flex-1 flex items-center gap-3 py-2 px-2 rounded-xl transition-all cursor-pointer",
                          checked ? "glow-green" : "bg-white/70 hover:bg-white",
                          disabled ? "opacity-50" : ""
                        )}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleMonthly(b.id)} disabled={disabled} />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{b.title}</div>
                          <div className="text-xs text-neutral-500">{checked ? "Selected" : "—"}</div>
                        </div>
                      </label>
                      {/* Up/Down buttons for selected monthly blogs */}
                      {isSelected && (
                        <motion.div className="flex flex-col gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                          <button
                            className="text-xs px-1 py-0.5 rounded bg-neutral-200 hover:bg-neutral-300"
                            style={{ opacity: idx === 0 ? 0.5 : 1 }}
                            disabled={idx === 0}
                            onClick={() => {
                              if (idx === 0) return;
                              const newOrder = [...monthlyOrder];
                              const temp = newOrder[idx - 1];
                              newOrder[idx - 1] = newOrder[idx];
                              newOrder[idx] = temp;
                              setMonthlyOrder(newOrder);
                            }}
                          >↑</button>
                          <button
                            className="text-xs px-1 py-0.5 rounded bg-neutral-200 hover:bg-neutral-300"
                            style={{ opacity: idx === monthlyOrder.length - 1 ? 0.5 : 1 }}
                            disabled={idx === monthlyOrder.length - 1}
                            onClick={() => {
                              if (idx === monthlyOrder.length - 1) return;
                              const newOrder = [...monthlyOrder];
                              const temp = newOrder[idx + 1];
                              newOrder[idx + 1] = newOrder[idx];
                              newOrder[idx] = temp;
                              setMonthlyOrder(newOrder);
                            }}
                          >↓</button>
                        </motion.div>
                      )}
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
              {monList.length === 0 && <motion.div className="text-sm text-neutral-500 py-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>No matches.</motion.div>}
            </Reorder.Group>
          </div>
        </motion.div>
      </div>

      <motion.div className="flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <button className="btn-liquid btn-liquid--brand flex items-center gap-2" onClick={save} disabled={saving}>
          {saving && (
            <svg className="animate-spin h-5 w-5 text-pink-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Auth ---------------- */
import logoMark from "../assets/navbar/aangan-logo-mark.svg";
import logoText from "../assets/navbar/aangan-text-logo.png";
function Login({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [email, setEmail] = useState("admin@aangan-pk.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#fde7ef] via-[#fff0f7] to-[#fff] font-sans relative overflow-hidden"
      style={{ minHeight: '100dvh' }}
      initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
      transition={{ type: "spring", duration: 1, bounce: 0.35 }}
    >
      {/* Decorative background shapes */}
      <motion.div
        className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-pink-200/40 rounded-full blur-3xl z-0 animate-pulse"
        initial={{ opacity: 0, scale: 0.7, x: -100, y: -100 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ delay: 0.2, duration: 1.2, type: "spring" }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 w-[340px] h-[340px] bg-rose-100/50 rounded-full blur-2xl z-0 animate-pulse"
        initial={{ opacity: 0, scale: 0.7, x: 100, y: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ delay: 0.3, duration: 1.2, type: "spring" }}
      />
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <motion.form
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
              // Login and get token
              const loginResponse = await api.post("/auth/login", { email, password });
              const { token, user } = loginResponse.data;
              
              // Store token in localStorage
              localStorage.setItem('authToken', token);
              
              onAuthed(user);
            } catch (err: any) {
              setError(err?.response?.data?.message || "Login failed. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
          className="relative w-[min(410px,94vw)] bg-white/95 rounded-3xl shadow-2xl px-10 py-12 border border-neutral-100 flex flex-col items-center z-10"
          style={{ backdropFilter: "blur(12px)" }}
          initial={{ y: 80, opacity: 0, scale: 0.9, rotate: -8 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1.1, bounce: 0.45 }}
        >
          <motion.div className="flex flex-col items-center w-full mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-2">
              <img src={logoMark} alt="Aangan Logo" className="h-12 drop-shadow-md" />
              <img src={logoText} alt="Aangan" className="h-7 drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight mb-1">Admin Login</h1>
            <p className="text-neutral-400 text-base text-center font-normal">Sign in to access the admin dashboard</p>
          </motion.div>
          <div className="w-full space-y-5">
            <motion.div className="flex flex-col gap-1" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label htmlFor="email" className="text-sm font-normal text-neutral-700">Email</label>
              <input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition text-base bg-white/80 shadow-sm font-normal"
                autoFocus
                autoComplete="username"
              />
            </motion.div>
            <motion.div className="flex flex-col gap-1 relative" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label htmlFor="password" className="text-sm font-normal text-neutral-700">Password</label>
              <input
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition text-base bg-white/80 shadow-sm pr-12 font-normal"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-[20%] h-9 flex items-center justify-center text-neutral-400 hover:text-pink-500 text-lg px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-pink-200"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye Off SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-5-10-7s4.477-7 10-7c1.326 0 2.59.26 3.75.725M19.07 19.07A9.956 9.956 0 0022 12c0-2-4.477-7-10-7m0 0c-1.326 0-2.59.26-3.75.725M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364L19.07 19.07M4.93 4.93l14.14 14.14" />
                  </svg>
                ) : (
                  // Eye SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c0 2-4.477 7-10 7S2 14 2 12s4.477-7 10-7 10 5 10 7z" />
                  </svg>
                )}
              </button>
            </motion.div>
            {error && <motion.div className="text-rose-600 text-sm text-center mt-1 font-medium bg-rose-50 border border-rose-100 rounded-lg py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
            <motion.button
              className="flex items-center gap-2 bg-pink-200 text-pink-800 border border-pink-300 rounded-xl px-4 py-2 font-semibold transition-all duration-150 hover:bg-pink-300 hover:text-pink-900 disabled:opacity-60 w-full mt-2 justify-center"
              disabled={loading}
              type="submit"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {loading && (
                <motion.svg className="animate-spin h-5 w-5 text-pink-400" viewBox="0 0 24 24" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </motion.svg>
              )}
              {loading ? "Signing in..." : "Sign in"}
            </motion.button>
          </div>
          <motion.div className="mt-8 w-full flex flex-col items-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Aangan Admin</div>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
}

/* ---------------- Editor (Create/Edit) ---------------- */
function EditorPanel({ mode, initial, setTab, setEditing }: { mode: "create" | "edit"; initial?: Blog; setTab?: (t: Tab) => void; setEditing?: (b: Blog | null) => void }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(() => initial?.slug || "");
  // Auto-generate slug from title
  useEffect(() => {
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  }, [title]);
  const [minutesRead, setMinutesRead] = useState(initial?.minutesRead || 5);
  const [categories, setCategories] = useState<string>((initial?.categories || []).join(", "));
  const [isFeatured] = useState<boolean>(!!initial?.isFeatured); // setIsFeatured removed as it's unused
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initial?.thumbnailUrl || "");
  const [html, setHtml] = useState<string>(initial?.html || "<p></p>");
  const [uploading, setUploading] = useState(false);

  const [placement] = useState<"none" | "top" | "monthly" | "latest">(initial?.placement || "latest");

  const [modal, setModal] = useState<{ open: boolean; title: string; message: string; kind: "success" | "error" | "info" }>({ open: false, title: "", message: "", kind: "success" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onDocx = async (f: File) => {
    const form = new FormData(); form.append("file", f);
    const res = await api.post<{ html: string }>("/import/docx", form, { headers: { "Content-Type": "multipart/form-data" } });
    setHtml(res.data.html);
  };

  const images_upload_handler = (blobInfo: any) =>
    new Promise<string>(async (resolve, reject) => {
      try {
        const form = new FormData();
        form.append("image", blobInfo.blob(), blobInfo.filename());
        const res = await api.post<{ url: string }>("/uploads/image", form);
        resolve(res.data.url);
      } catch (e) { reject(e); }
    });

  const openModal = (title: string, message: string, kind: "success" | "error" | "info" = "success") =>
    setModal({ open: true, title, message, kind });

  const save = async () => {
    if (!thumbnailUrl) { openModal("Cannot Save", "Thumbnail image is missing.", "error"); return; }
    if (!title.trim()) { openModal("Cannot Save", "Title is required.", "error"); return; }
    if (!html || html === "<p></p>") { openModal("Cannot Save", "Content is empty.", "error"); return; }

    setUploading(true);
    try {
      const base = {
        title, slug, html, minutesRead,
        categories: (typeof categories === "string" ? categories.split(",") : []).map(s => s.trim()).filter(Boolean),
        thumbnailUrl, placement
      } as any;

      if (mode === "create") {
        await api.post<Blog>("/blogs", base);
        openModal("Saved", "Your blog has been saved.");
        setTitle(""); setSlug(""); setHtml("<p></p>"); setMinutesRead(5); setCategories(""); setThumbnailUrl("");
      } else if (mode === "edit" && initial) {
        const payload = { ...base, isFeatured };
        await api.put<Blog>(`/blogs/${(initial as any).id}`, payload);
        openModal("Updated", "Your blog has been edited.");
        // After successful edit, go back to blogs list
        if (setTab) setTimeout(() => { setTab("blogs"); if (setEditing) setEditing(null); }, 1000);
      }
    } catch (e: any) {
      openModal("Save Failed", e?.response?.data?.message || e?.message || "Unknown error", "error");
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <div className="space-y-5">
        <div className="panel-glass overflow-hidden animate-pulse">
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-white/60">
            <span className="h-3 w-3 rounded-full bg-red-200" />
            <span className="h-3 w-3 rounded-full bg-yellow-200" />
            <span className="h-3 w-3 rounded-full bg-green-200" />
            <span className="ml-3 h-5 w-40 bg-white/70 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            <div className="md:col-span-3 p-4 md:p-6 space-y-3">
              <div className="rounded-2xl border border-pink-100 bg-white/60 backdrop-blur px-3 py-3 shadow">
                <div className="h-8 w-2/3 bg-white/80 rounded" />
              </div>
              <div className="border border-pink-100 bg-white/60 backdrop-blur shadow rounded-xl">
                <div className="h-[340px] md:h-[680px] w-full bg-white/70 rounded-xl" />
              </div>
            </div>
            <div className="md:col-span-1 p-4 md:p-6 space-y-3">
              <div className="h-12 w-full bg-white/80 rounded-xl" />
              <div className="h-12 w-full bg-white/70 rounded-xl" />
              <div className="h-12 w-full bg-white/60 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <div className="panel-glass overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-white/60">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-sm text-neutral-600">{title || "Untitled Document"}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          <div className="md:col-span-3 p-4 md:p-6">
            <div className="space-y-3">
              <div className="rounded-2xl border border-pink-200 bg-white/60 backdrop-blur px-3 py-1.5 shadow">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input-glass bg-transparent" />
              </div>

              <div className="border border-pink-200 bg-white/60 backdrop-blur shadow" style={{ borderRadius: '0.675rem' }}>
                <Editor
                  apiKey={TINYMCE_API_KEY}
                  value={html}
                  onEditorChange={(val) => setHtml(val)}
                  init={{
                    height: 680,
                    menubar: true,
                    plugins: "link lists table image code fullscreen",
                    toolbar:
                      "undo redo | formatselect fontfamily fontsize | bold italic underline forecolor backcolor | " +
                      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table image | removeformat | code fullscreen",
                    fontsize_formats: Array.from({ length: 36 }, (_, i) => `${i + 1}pt`).join(" "),
                    font_family_formats: "Times New Roman=Times New Roman, Times, serif; Arial=Arial, Helvetica, sans-serif; Georgia=Georgia, serif",
                    images_upload_handler,
                    branding: false,
                    content_style: "body{font-family:'Times New Roman', Times, serif; padding:16px;}"
                  }}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col items-center gap-4 p-4 md:p-6 mt-2">
            <div className="flex flex-col w-full gap-2">
              <button className="flex items-center gap-2 w-full bg-white text-pink-700 border border-pink-200 rounded-xl px-4 py-2 font-semibold transition-all duration-150 hover:bg-pink-50 hover:text-pink-900 disabled:opacity-60" onClick={() => fileInputRef.current?.click()}>Upload .docx</button>
              <input type="file" accept=".docx" ref={fileInputRef} onChange={e => e.target.files && onDocx(e.target.files[0])} hidden />
              <button className="flex items-center gap-2 w-full bg-pink-200 text-pink-800 border border-pink-300 rounded-xl px-4 py-2 font-semibold transition-all duration-150 hover:bg-pink-300 hover:text-pink-900 disabled:opacity-60" onClick={save} disabled={uploading}>
                {uploading && (
                  <svg className="animate-spin h-5 w-5 text-pink-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {uploading ? "Saving..." : "Save"}
              </button>
            </div>
            {/* Minutes Read */}
            <div className="rounded-2xl bg-white/80 shadow-sm border border-neutral-200 p-4 flex flex-col gap-2 w-full">
              <label className="text-base font-semibold text-neutral-700">Minutes Read</label>
              <input
                type="number"
                min={1}
                value={minutesRead}
                onChange={e => setMinutesRead(parseInt(e.target.value || '5', 10))}
                className="input-glass px-3 py-2 rounded-lg border border-neutral-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
            {/* Categories */}
            <div className="rounded-2xl bg-white/80 shadow-sm border border-neutral-200 p-4 flex flex-col gap-2 w-full">
              <label className="text-base font-semibold text-neutral-700">Categories</label>
              <textarea
                value={categories}
                onChange={e => setCategories(e.target.value)}
                onInput={e => {
                  const ta = e.currentTarget;
                  ta.style.height = 'auto';
                  ta.style.height = ta.scrollHeight + 'px';
                }}
                rows={2}
                placeholder="Comma separated (e.g. Health, Nature)"
                className="input-glass px-3 py-2 rounded-lg border border-neutral-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition overflow-hidden"
                style={{ minHeight: '40px', maxHeight: '200px' }}
              />
            </div>
            {/* Thumbnail */}
            <div className="rounded-2xl bg-white/80 shadow-sm border border-neutral-200 p-4 w-full">
              <ThumbUploader thumbnailUrl={thumbnailUrl} setThumbnailUrl={setThumbnailUrl} />
            </div>
          </div>
        </div>
      </div>

      <MiniModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        kind={modal.kind}
        onClose={() => setModal(m => ({ ...m, open: false }))}
      />
    </div>
  );
}

/* ---------------- Thumbnail Uploader ---------------- */
function ThumbUploader({ thumbnailUrl, setThumbnailUrl }:{
  thumbnailUrl: string; setThumbnailUrl: (u:string)=>void;
}) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [cropperKey, setCropperKey] = useState(0);

  const onFile = (f: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(String(reader.result));
      setOpen(true);
      setCropperKey(prev => prev + 1);
      setZoom(1); setCrop({ x: 0, y: 0 }); setCroppedAreaPixels(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.onerror = () => setError("Failed to read image.");
    reader.readAsDataURL(f);
  };

  const onCropComplete = (_: any, areaPixels: any) => setCroppedAreaPixels(areaPixels);

  const getCenteredCrop = (imgW: number, imgH: number, aspect = 16 / 9) => {
    let width = imgW, height = Math.round(imgW / aspect);
    if (height > imgH) { height = imgH; width = Math.round(imgH * aspect); }
    const x = Math.round((imgW - width) / 2);
    const y = Math.round((imgH - height) / 2);
    return { x, y, width, height };
  };

  const confirm = async () => {
    if (!imageSrc) return;
    setSaving(true);
    try {
      const img = new Image(); img.src = imageSrc; await img.decode();
      const area = croppedAreaPixels || getCenteredCrop(img.naturalWidth, img.naturalHeight, 16 / 9);

      const OUT_W = 1200, OUT_H = 675;
      const canvas = document.createElement("canvas");
      canvas.width = OUT_W; canvas.height = OUT_H;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUT_W, OUT_H);

      const blob: Blob = await new Promise((res) => canvas.toBlob(b => res(b as Blob), "image/jpeg", 0.9));
      if (!blob) throw new Error("Could not create image blob");

      const file = new File([blob], "thumb.jpg", { type: "image/jpeg" });
      const form = new FormData(); form.append("image", file);
      const up = await api.post<{ url: string }>("/uploads/image", form);
      setThumbnailUrl(up.data.url);
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || "Failed to save thumbnail");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-accent space-y-2">
      {thumbnailUrl && <img src={thumbnailUrl} className="w-full rounded-xl" alt="thumbnail" />}
      <div className="w-full flex items-center gap-2">
        <label className="btn-liquid btn-liquid--ghost cursor-pointer mb-0">
          Choose File
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files && onFile(e.target.files[0])}
          />
        </label>
        <div className="flex-1 min-w-0">
          <div className="bg-white/80 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-700 truncate w-full overflow-x-auto">
            {thumbnailUrl
              ? thumbnailUrl.split('/').pop()
              : "No file chosen"}
          </div>
        </div>
      </div>

      {open && (
  <div className="fixed inset-0 bg-white/70 backdrop-blur-[6px] z-[120] grid place-items-center">
          <div className="bg-white/60 border border-white/30 shadow-2xl rounded-2xl p-4 w-[min(90vw,900px)] backdrop-blur-xl" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.18)'}}>
            <div className="relative h-[60vh] bg-white/30 rounded-xl overflow-hidden backdrop-blur-md">
              <Cropper
                key={cropperKey}
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition={false}
              />
            </div>
            {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button
                className="flex items-center gap-2 bg-white text-rose-600 border border-rose-200 rounded-xl px-4 py-2 font-semibold transition-all duration-150 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 bg-pink-200 text-pink-800 border border-pink-300 rounded-xl px-4 py-2 font-semibold transition-all duration-150 hover:bg-pink-300 hover:text-pink-900 disabled:opacity-60"
                onClick={confirm}
                disabled={saving}
              >
                {saving && (
                  <svg className="animate-spin h-5 w-5 text-pink-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {saving ? "Saving…" : "Save Thumbnail"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
