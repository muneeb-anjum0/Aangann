// WaitlistSection: Email waitlist signup form
import { useState, useRef, useCallback, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import backgroundPattern from "../assets/waitlist/background-pattern.png";
import emailIcon from "../assets/waitlist/email-icon.svg";

// -------- API base URL --------
const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

type Note = { kind: "ok" | "err" | null; text: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<Note>({ kind: null, text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const hpRef = useRef<HTMLInputElement>(null); // honeypot
  const reduceMotion = useReducedMotion();

  // Static background style, no animation
  const bgStyle = {
    backgroundImage: `url(${backgroundPattern})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  } as const;

  const onEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isLoading) return;
      if (hpRef.current?.value) return; // spam/honeypot

      const value = email.trim().toLowerCase();
      const isValid = EMAIL_RE.test(value);
      if (!isValid) {
        setNote({ kind: "err", text: "Please enter a valid email." });
        noteRef.current?.focus();
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/api/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setEmail("");
        inputRef.current?.blur();
        setNote({ kind: "ok", text: "Thanks! You’re on the list." });
        requestAnimationFrame(() => noteRef.current?.focus());
      } catch {
        setNote({ kind: "err", text: "Something went wrong. Please try again." });
        noteRef.current?.focus();
      } finally {
        setIsLoading(false); // <- ensure the button resets
      }
    },
    [email, isLoading]
  );

  // ---- Liquid glass Join button (compact) ----
  const joinBtnClasses =
    [
      "relative group inline-flex items-center justify-center gap-2 text-center",
  "h-12 px-5 rounded-full font-semibold text-base text-pink-700 border border-black bg-white/60 shadow-sm hover:bg-pink-100 transition-all duration-150",
      "focus:outline-none focus:ring-2 focus:ring-pink-300/60 focus:ring-offset-2",
      "disabled:opacity-60 disabled:cursor-not-allowed",
      "min-w-[110px]"
    ].join(" ");

  return (
    <motion.section
      className="relative w-full overflow-x-hidden"
      initial={reduceMotion ? undefined : { opacity: 0, y: 60 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduceMotion ? undefined : { duration: 0.9, ease: "easeOut" }}
    >
      {/* keep OLD pink, static background */}
      <div className="relative w-full bg-[#ffa9cd]" style={bgStyle}>
        <div className="absolute inset-0 pointer-events-none bg-white/0 sm:bg-white/0" />

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center justify-center gap-6 px-4 sm:px-6 py-16 sm:py-24 min-h-[380px] sm:min-h-[420px]">
          <h2 className="text-[1.15rem] sm:text-2xl lg:text-3xl font-medium text-center text-black leading-tight">
            Join the Waitlist!
          </h2>

          <p className="text-[0.95rem] sm:text-base text-center text-black max-w-[90vw] sm:max-w-2xl">
            Join over 100,000 women already tracking their health with Aangan.
            Be a part of a community that supports, understands, and empowers you.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-[95vw] sm:max-w-md" noValidate>
            <label htmlFor="waitlist-email" className="sr-only">
              Enter your email to join the waitlist
            </label>

            {/* Honeypot */}
            <input
              ref={hpRef}
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="sr-only"
              aria-hidden="true"
            />

            {/* MATCHED ROUNDNESS WITH BUTTON */}
            <div className="flex items-stretch rounded-[999px] overflow-hidden border border-neutral-700 bg-white/95 backdrop-blur-sm shadow-sm focus-within:ring-2 focus-within:ring-black/30">
              <input
                ref={inputRef}
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email to join the waitlist"
                value={email}
                onChange={onEmailChange}
                className="flex-1 bg-transparent outline-none px-4 text-[16px] placeholder-neutral-500 text-neutral-800 h-12"
                aria-invalid={note.kind === "err" || undefined}
                aria-describedby="waitlist-note"
                enterKeyHint="go"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className={`${joinBtnClasses} border-l border-neutral-300/70`}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {/* glass layers */}
                <span
                  className="pointer-events-none absolute inset-[1px] rounded-[999px] opacity-80"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.2) 38%, rgba(255,255,255,0.08) 65%, rgba(255,255,255,0.05) 100%)",
                  }}
                />
                <span className="pointer-events-none absolute -top-3 left-5 h-8 w-20 rounded-full bg-white/60 blur-2xl opacity-70 transform-gpu transition-transform duration-500 ease-out group-hover:translate-x-6 group-hover:translate-y-1" />
                <span className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/4 rotate-12 bg-white/30 blur-md opacity-0 group-hover:opacity-70 group-hover:translate-x-[200%] transition-all duration-700 ease-out" />

                {/* label */}
                {!isLoading ? (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <img
                      className="w-4 h-4 select-none pointer-events-none"
                      alt=""
                      src={emailIcon}
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                    />
                    <span>Join</span>
                  </span>
                ) : (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                      <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    <span>Sending…</span>
                  </span>
                )}
              </button>
            </div>

            <p
              id="waitlist-note"
              ref={noteRef}
              role="status"
              aria-live="polite"
              tabIndex={-1}
              className={`mt-2 text-xs text-center px-2 ${
                note.kind === "err"
                  ? "text-red-700"
                  : note.kind === "ok"
                  ? "text-green-700"
                  : "text-black/80"
              }`}
            >
              {note.text || "No spam. Unsubscribe anytime."}
            </p>
          </form>
        </div>
      </div>
    </motion.section>
  );
};

export default WaitlistSection;
