// FAQ: Frequently Asked Questions section with expand/collapse
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { twMerge } from "tailwind-merge";

// ---------- API base URL ----------
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

// ---------- Type definitions ----------
type FaqItem = { question: string; answer: string };
type Props = {
  multiOpen?: boolean;
  onAsk?: () => void;
  askHref?: string; // kept for backwards-compat (not used for opening; modal is default)
  onSubmitQuestion?: (data: { question: string; email?: string }) => Promise<void> | void;
};
type FaqWithIds = FaqItem & { slug: string; headerId: string; panelId: string };

// ---------- FAQ data ----------
const faqs: FaqItem[] = [
  {
    question: "Is Aangan free to use?",
    answer:
      "Yes! Aangan offers free access to core features like period tracking, symptom logging, and basic health insights. You can also upgrade to Premium for doctor access and personalized care tools.",
  },
  {
    question: "How accurate are the cycle predictions?",
    answer:
      "Aangan uses your past period data, symptoms, and lifestyle logs to improve prediction accuracy over time. The more you track, the smarter it gets!",
  },
  {
    question: "Can I talk to a real doctor through the app?",
    answer:
      "Absolutely. With a Premium plan, you can view verified doctor profiles, check their availability, and book appointments either online or inperson.",
  },
  {
    question: "What are desi remedies, and are they doctor approved?",
    answer:
      "Desi remedies are natural, culturally rooted wellness tips like herbal teas or food based solutions. We curate them with input from doctors and herbalists to ensure safety and effectiveness.",
  },
  {
    question: "I'm a teenager. Is this app right for me?",
    answer:
      "Yes! Aangan is designed for all age groups including teens just starting their period journey. It's easy to use, private, and supportive.",
  },
  {
    question: "Is my health data private?",
    answer:
      "100%. Your data is stored securely and is never shared without your permission. You're always in control of your information.",
  },
];

/* ---------- Utils ---------- */
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

/* ---------- Liquid Glass CTA (no emoji) ---------- */
const ctaClasses = [
  "group relative inline-flex items-center justify-center gap-3",
  "px-8 py-3 rounded-[999px] text-lg font-semibold",
  "text-pink-700 select-none overflow-hidden whitespace-nowrap",
  "bg-white/60 border border-pink-300 shadow-sm",
  "transition-all duration-150",
  "hover:bg-pink-100",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2"
].join(" ");

const GlassLayers = () => (
  <>
    <span
      className="pointer-events-none absolute inset-[1px] rounded-[999px] opacity-80"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.22) 35%, rgba(255,255,255,0.10) 60%, rgba(255,255,255,0.06) 100%)",
      }}
    />
    <span className="pointer-events-none absolute -top-4 left-6 h-10 w-24 rounded-full bg-white/60 blur-2xl opacity-70 transform-gpu transition-transform duration-500 ease-out group-hover:translate-x-6 group-hover:translate-y-1" />
    <span className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-white/30 blur-md opacity-0 group-hover:opacity-70 group-hover:translate-x-[220%] transition-all duration-700 ease-out" />
  </>
);

const CtaLabel = ({ text = "Ask a Question" }: { text?: string }) => (
  <span className="relative z-10 inline-flex items-center gap-2.5">
    <span>{text}</span>
  </span>
);

/* ---------- Ask Modal ---------- */
function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [locked]);
}

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function trapTabKey(e: React.KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
  if (elements.length === 0) return;
  const first = elements[0];
  const last = elements[elements.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
}

function AskModal({
  open,
  onClose,
  onSubmit,
  // baseTransition, // removed unused
  reduce,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: { question: string; email?: string }) => Promise<void> | void;
  // baseTransition: { duration: number; ease: "easeOut" };
  reduce: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const maxChars = 500;

  useLockBody(open);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 10);
    } else {
      setQuestion("");
      setEmail("");
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    try {
      setSubmitting(true);

      if (onSubmit) {
        await onSubmit({
          question: question.trim(),
          email: email.trim() || undefined,
        });
      } else {
        const res = await fetch(`${API_BASE}/api/faq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question.trim(),
            email: email.trim() || undefined,
          }),
        });
        if (!res.ok) throw new Error("Failed to save question");
      }

      onClose();
    } catch (err) {
      alert("Failed to save your question. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          aria-hidden={!open}
          className="fixed inset-0 z-[80] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
        >
          {/* Overlay */}
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-modal-title"
            ref={dialogRef}
            className={[
              "relative z-[81] w-[92vw] max-w-xl",
              "rounded-[22px] border border-[#efc7d7]",
              "bg-white",
              "shadow-[0_22px_60px_rgba(155,84,105,0.18)]",
            ].join(" ")}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
            onKeyDown={(e) => {
              if (e.key === "Tab") trapTabKey(e, dialogRef.current);
            }}
          >
            {/* inner glow ring */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[1px] rounded-[20px]"
              style={{
                boxShadow:
                  "inset 0 0 22px rgba(254,222,230,0.45), inset 0 0 44px rgba(254,222,230,0.35), inset 0 0 88px rgba(254,222,230,0.28)",
              }}
            />

            <div className="relative p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <h3
                  id="ask-modal-title"
                  className="font-['Lexend'] text-black text-[22px] sm:text-[26px] font-semibold leading-tight"
                >
                  Ask a Question
                </h3>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-[#fedee6]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-[#9b5469]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <p className="mt-1 mb-4 font-['Inter'] text-[#2b2b2b] text-sm sm:text-base">
                Hum sun rahe hain apna sawal yahan likhein. Our team will get back ASAP.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-['Lexend'] text-sm text-[#9b5469] mb-1.5">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={[
                        "w-full rounded-2xl border bg-white px-4 py-3",
                        "font-['Inter'] text-sm sm:text-base text-black placeholder:text-[#9b5469]/50",
                        "border-[#efc7d7] focus:outline-none focus:ring-2 focus:ring-pink-300",
                      ].join(" ")}
                  />
                </div>

                <div>
                  <label className="block font-['Lexend'] text-sm text-[#9b5469] mb-1.5">
                    Your Question <span className="text-[#c43c5e]">*</span>
                  </label>
                  <div
                    className={[
                        "rounded-2xl border bg-white",
                        "border-[#efc7d7] focus-within:border-[#e9b1c6]",
                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
                      ].join(" ")}
                  >
                    <textarea
                      ref={textareaRef}
                      value={question}
                      onChange={(e) => {
                        const v = e.target.value.slice(0, maxChars);
                        setQuestion(v);
                      }}
                      placeholder="Write your question…"
                      rows={5}
                      className="w-full resize-y rounded-2xl bg-transparent px-4 py-3 font-['Inter'] text-sm sm:text-base text-black placeholder:text-[#9b5469]/50 focus:outline-none"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-['Inter'] text-xs text-[#9b5469]/70">
                      {question.length}/{maxChars}
                    </span>
                    {!question.trim() && (
                      <span className="font-['Inter'] text-xs text-[#c43c5e]">Question is required</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className={twMerge(ctaClasses, "px-5 py-2.5")}
                  >
                    <GlassLayers />
                    <span className="relative z-10 font-['Lexend']">Cancel</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!question.trim() || submitting}
                    className={[
                      ctaClasses,
                      "px-5 py-2.5 sm:px-6 sm:py-3",
                      submitting || !question.trim() ? "opacity-60 pointer-events-none" : "",
                    ].join(" ")}
                  >
                    <GlassLayers />
                    <span className="relative z-10 font-['Lexend']">
                      {submitting ? "Sending…" : "Submit"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Row ---------- */
const FaqRow = React.memo(function FaqRow({
  faq,
  index,
  open,
  toggle,
  baseTransition,
  reduce,
}: {
  faq: FaqWithIds;
  index: number;
  open: boolean;
  toggle: (i: number) => void;
  baseTransition: { duration: number; ease: "easeOut" };
  reduce: boolean;
}) {
  return (
    <motion.div
      key={faq.slug}
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ layout: { duration: reduce ? 0 : 0.18, ease: "easeOut" }, ...baseTransition }}
      className={[
        "relative rounded-[20px] border border-[#efc7d7] bg-white/90 backdrop-blur-xl",
        "transition-[box-shadow,transform] duration-150 ease-out will-change-transform",
        open ? "shadow-none" : "hover:scale-[1.01]"
      ].join(" ")}
    >
      {/* uniform inner glow ring (#fedee6) — on hover OR when open */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-[1px] rounded-[18px] transition-opacity duration-150 ${
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{
          boxShadow:
            "inset 0 0 22px rgba(254,222,230,0.45), inset 0 0 44px rgba(254,222,230,0.35), inset 0 0 88px rgba(254,222,230,0.28)",
        }}
      />

      <h3 className="m-0">
        <button
          type="button"
          id={faq.headerId}
          aria-controls={faq.panelId}
          aria-expanded={open}
          onClick={() => toggle(index)}
          className={[
            "relative z-10 w-full text-left flex justify-between items-center",
            "px-4 py-3 sm:px-6 sm:py-4 min-h-[44px]",
            "font-['Lexend'] font-semibold text-black text-base sm:text-lg",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2",
          ].join(" ")}
        >
          <span className="pr-3">{faq.question}</span>
          <motion.svg
            className="shrink-0 w-5 h-5 text-[#9b5469]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={faq.panelId}
            role="region"
            aria-labelledby={faq.headerId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative z-10 px-4 pb-3 pt-1.5 sm:px-6 sm:pb-4"
          >
            <p className="font-['Inter'] text-[#2b2b2b] leading-relaxed text-sm sm:text-base">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
},
(prev, next) =>
  prev.open === next.open &&
  prev.faq.question === next.faq.question &&
  prev.faq.answer === next.faq.answer &&
  prev.faq.slug === next.faq.slug
);

/* ---------- Component ---------- */
const FAQ: React.FC<Props> = React.memo(function FAQ({
  multiOpen = false,
  onAsk,
  onSubmitQuestion,
}) {
  const reduce = !!useReducedMotion();

  const items: FaqWithIds[] = useMemo(() => {
    return faqs.map((f) => {
      const slug = slugify(f.question);
      return { ...f, slug, headerId: `faq-header-${slug}`, panelId: `faq-panel-${slug}` };
    });
  }, []);

  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set());
  const [query] = useState(""); // removed unused setQuery
  const [showAsk, setShowAsk] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (x) => x.question.toLowerCase().includes(q) || x.answer.toLowerCase().includes(q)
    );
  }, [items, query]);

  const isOpen = useCallback((idx: number) => openSet.has(idx), [openSet]);

  const clearHash = useCallback(() => {
    if (typeof window !== "undefined") {
      const { pathname, search } = window.location;
      history.replaceState(null, "", `${pathname}${search}`);
    }
  }, []);

  const setHash = useCallback(
    (slug?: string) => {
      if (typeof window === "undefined") return;
      if (!slug) return void clearHash();
      history.replaceState(null, "", `#${slug}`);
    },
    [clearHash]
  );

  const openBySlug = useCallback(
    (hash: string) => {
      const target = hash.startsWith("#") ? hash.slice(1) : hash;
      const idx = items.findIndex((x) => x.slug === target);
      if (idx >= 0) {
        setOpenSet((prev) => {
          const next = new Set(prev);
          if (multiOpen) next.add(idx);
          else {
            next.clear();
            next.add(idx);
          }
          return next;
        });
      }
    },
    [items, multiOpen]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) openBySlug(window.location.hash);
    const onHashChange = () => openBySlug(window.location.hash);
    window.addEventListener("hashchange", onHashChange, { passive: true });
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [openBySlug]);

  const toggle = useCallback(
    (index: number) => {
      setOpenSet((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else {
          if (!multiOpen) next.clear();
          next.add(index);
        }
        if (next.size === 0) setHash(undefined);
        else {
          const first = Math.min(...Array.from(next));
          setHash(items[first].slug);
        }
        return next;
      });
    },
    [items, multiOpen, setHash]
  );

  const baseTransition = useMemo(
    () => ({ duration: reduce ? 0 : 0.22, ease: "easeOut" as const }),
    [reduce]
  );

  const openAskModal = useCallback(() => {
    setShowAsk(true);
    onAsk?.(); // keep analytics hook
  }, [onAsk]);

  return (
    <motion.section
      className="w-full pt-20 pb-12 px-3 sm:pt-28 sm:pb-14 sm:px-6 md:px-16 bg-[#fdf8f7] overflow-visible"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title + subtitle */}
        <motion.h2
          className="text-center font-['Lexend'] text-black text-[30px] sm:text-[40px] md:text-[48px] font-light leading-tight mb-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.02, duration: 0.22, ease: "easeOut" }}
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.p
          className="text-center font-['Inter'] text-black text-[15px] sm:text-lg leading-relaxed max-w-2xl mx-auto mb-4"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.04, duration: 0.2, ease: "easeOut" }}
        >
          Quick answers to the things people ask us the most.
        </motion.p>

        {/* (Optional) tiny search box if you want to expose the existing filter */}
        {/* <div className="max-w-md mx-auto mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs…"
            className="w-full rounded-full border border-[#efc7d7] bg-white/90 px-4 py-2.5 font-['Inter'] text-sm text-black placeholder:text-[#9b5469]/50 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div> */}

        {/* Tighter spacing between FAQ items */}
        <div className="space-y-1.5 sm:space-y-2">
          {filtered.map((faq, index) => (
            <div key={faq.slug} className="group">
              <FaqRow
                faq={faq}
                index={index}
                open={isOpen(index)}
                toggle={toggle}
                baseTransition={baseTransition}
                reduce={reduce}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-7 sm:mt-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.08, ...baseTransition }}
        >
          <button type="button" onClick={openAskModal} aria-label="Ask a Question" className={ctaClasses}>
            <GlassLayers />
            <CtaLabel />
          </button>
          {/* If you still want to surface askHref somewhere:
          {askHref && (
            <div className="mt-3">
              <a href={askHref} className="font-['Inter'] text-sm text-[#9b5469] underline">
                or open the full form
              </a>
            </div>
          )} */}
        </motion.div>
      </div>

      {/* Modal mount */}
      <AskModal
        open={showAsk}
        onClose={() => setShowAsk(false)}
        onSubmit={onSubmitQuestion}
        reduce={reduce}
      />
    </motion.section>
  );
});

export default FAQ;
