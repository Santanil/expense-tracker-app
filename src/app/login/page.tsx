"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";

type Mode = "sign-in" | "sign-up" | "reset";

const TAGLINE_WORDS = "We're watching your money so you don't have to.".split(" ");

function CardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="26" height="18" rx="3" stroke="rgba(47,230,200,0.55)" strokeWidth="2" />
      <rect x="3" y="12" width="26" height="4" fill="rgba(47,230,200,0.35)" />
    </svg>
  );
}

function RupeeIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 items-center justify-center font-display text-2xl"
      style={{ color: "rgba(47,230,200,0.6)" }}
    >
      ₹
    </span>
  );
}

function ChartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="18" width="5" height="10" fill="rgba(47,230,200,0.4)" />
      <rect x="13" y="10" width="5" height="18" fill="rgba(47,230,200,0.5)" />
      <rect x="22" y="4" width="5" height="24" fill="rgba(47,230,200,0.6)" />
    </svg>
  );
}

function PulseDot({ top, left, delay }: { top: string; left: string; delay: string }) {
  return (
    <div
      className="anim-pulse-dot absolute h-1.5 w-1.5 rounded-full"
      style={{ top, left, backgroundColor: "rgba(47,230,200,0.5)", animationDelay: delay }}
    />
  );
}

function TrackedIcon({
  icon,
  top,
  left,
  floatDuration,
  floatDelay,
  scanDelay
}: {
  icon: React.ReactNode;
  top: string;
  left: string;
  floatDuration: string;
  floatDelay: string;
  scanDelay: string;
}) {
  return (
    <div
      className="anim-float absolute"
      style={{ top, left, animationDuration: floatDuration, animationDelay: floatDelay }}
    >
      <div className="relative flex h-8 w-8 items-center justify-center">
        {icon}
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          className="anim-scan absolute -inset-[7px]"
          style={{ animationDelay: scanDelay }}
        >
          <path d="M2,12 L2,2 L12,2" stroke="rgba(47,230,200,0.6)" strokeWidth="2" strokeLinecap="round" />
          <path d="M34,2 L44,2 L44,12" stroke="rgba(47,230,200,0.6)" strokeWidth="2" strokeLinecap="round" />
          <path d="M44,34 L44,44 L34,44" stroke="rgba(47,230,200,0.6)" strokeWidth="2" strokeLinecap="round" />
          <path d="M12,44 L2,44 L2,34" stroke="rgba(47,230,200,0.6)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { session } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (session) router.replace("/home");
  }, [session, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ kind: "error", text: error.message });
      else router.replace("/home");
    }

    if (mode === "sign-up") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ kind: "error", text: error.message });
      } else {
        setMessage({
          kind: "info",
          text: "Account created. Check your email to confirm, then sign in."
        });
        setMode("sign-in");
      }
    }

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setMessage({ kind: "error", text: error.message });
      else
        setMessage({
          kind: "info",
          text: "Password reset email sent — check your inbox."
        });
    }

    setSubmitting(false);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[45%] w-full overflow-hidden sm:hidden"
      >
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 400 300"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M0,220 L40,180 L80,205 L120,140 L160,175 L200,110 L240,155 L280,90 L320,135 L360,65 L400,105"
            fill="none"
            stroke="rgba(47,230,200,0.18)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="anim-draw-line"
            style={{ animationDuration: "2.2s", animationDelay: "200ms" }}
          />
        </svg>

        <PulseDot top="58.33%" left="40%" delay="0ms" />
        <PulseDot top="30%" left="70%" delay="500ms" />
        <PulseDot top="21.67%" left="90%" delay="1000ms" />

        <TrackedIcon
          icon={<CardIcon />}
          top="10%"
          left="10%"
          floatDuration="4.5s"
          floatDelay="0s"
          scanDelay="0s"
        />
        <TrackedIcon
          icon={<RupeeIcon />}
          top="15%"
          left="75%"
          floatDuration="5.5s"
          floatDelay="0.4s"
          scanDelay="1.1s"
        />
        <TrackedIcon
          icon={<ChartIcon />}
          top="58%"
          left="55%"
          floatDuration="5s"
          floatDelay="0.8s"
          scanDelay="2.2s"
        />
      </div>

      {/* Desktop/tablet: one diagonal trend line rising from the bottom-left
          corner to the top-right corner, spanning the full page behind the
          content (z-0 vs. the content wrapper's z-10) rather than being
          confined to the side margins. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden sm:block"
      >
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 1000 600"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M0,580 L100,520 L180,540 L260,460 L340,480 L420,380 L500,410 L580,300 L660,330 L740,220 L820,250 L900,140 L1000,20"
            fill="none"
            stroke="rgba(47,230,200,0.18)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="anim-draw-line"
            style={{ animationDuration: "2.6s", animationDelay: "200ms" }}
          />
        </svg>

        <PulseDot top="80%" left="34%" delay="0ms" />
        <PulseDot top="55%" left="66%" delay="600ms" />
        <PulseDot top="23.33%" left="90%" delay="1200ms" />

        <TrackedIcon
          icon={<CardIcon />}
          top="14%"
          left="8%"
          floatDuration="4.8s"
          floatDelay="0.2s"
          scanDelay="0.5s"
        />
        <TrackedIcon
          icon={<ChartIcon />}
          top="66%"
          left="10%"
          floatDuration="5.2s"
          floatDelay="0.6s"
          scanDelay="1.8s"
        />
        <TrackedIcon
          icon={<RupeeIcon />}
          top="38%"
          left="88%"
          floatDuration="5.5s"
          floatDelay="0.4s"
          scanDelay="1.1s"
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-10 pt-16 sm:justify-center sm:pb-16">
        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-ink/10 border-t-ink/25 bg-ink/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8 lg:max-w-xl lg:rounded-3xl lg:p-12 lg:shadow-[0_12px_48px_rgba(0,0,0,0.35)] lg:backdrop-blur">
          <div className="anim-fade-up flex items-center gap-3 lg:gap-4">
            <svg
              viewBox="0 0 56 24"
              fill="none"
              aria-hidden="true"
              className="h-6 w-14 shrink-0 lg:h-9 lg:w-[84px]"
            >
              <path
                d="M2 18 L16 18 L22 8 L30 14 L38 6 L46 10 L54 4"
                stroke="#2FE6C8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                className="anim-draw-line"
                style={{ animationDelay: "150ms" }}
              />
              <circle
                cx="54"
                cy="4"
                r="3"
                fill="#2FE6C8"
                style={{ filter: "drop-shadow(0 0 4px rgba(47,230,200,0.8))" }}
              />
            </svg>
            <p className="font-body text-xs uppercase tracking-wide text-ledger">
              Personal finance
            </p>
          </div>

          <h1
            className="anim-fade-up mt-2 font-display text-4xl leading-tight text-ink lg:mt-3"
            style={{ animationDelay: "80ms" }}
          >
            Ledger
          </h1>

          <p className="mt-2 font-body text-sm text-ink/60 lg:mt-3">
            {TAGLINE_WORDS.map((word, i) => (
              <span
                key={i}
                className="anim-word-in inline-block"
                style={{ animationDelay: `${280 + i * 60}ms` }}
              >
                {word}
                {i < TAGLINE_WORDS.length - 1 ? " " : ""}
              </span>
            ))}
          </p>

          <div
            className="anim-fade-up mt-4 flex gap-6 border-t border-line pt-3 font-mono text-[11px] lg:mt-6 lg:gap-9 lg:pt-4"
            style={{ animationDelay: "950ms" }}
          >
            <span className="flex items-baseline gap-1.5">
              <span className="text-ink/40">ledger</span>
              <span className="text-ledger">synced</span>
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-ink/40">tracking</span>
              <span className="text-ledger">active</span>
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="on"
            className="anim-fade-up mt-10 space-y-6 lg:mt-12 lg:space-y-8"
            style={{ animationDelay: "150ms" }}
          >
            <label className="block">
              <span className="font-body text-xs text-ink/60">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger lg:py-3"
                placeholder="you@example.com"
              />
            </label>

            {mode !== "reset" && (
              <label className="block">
                <span className="font-body text-xs text-ink/60">Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger lg:py-3"
                  placeholder="••••••••"
                />
              </label>
            )}

            {message && (
              <p
                className={
                  "font-body text-sm " +
                  (message.kind === "error" ? "text-rust" : "text-ledger")
                }
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-glow w-full bg-ink py-3 font-body text-sm text-paper transition hover:bg-ledger disabled:opacity-60 lg:py-4"
            >
              {mode === "sign-in" && (submitting ? "Signing in…" : "Sign in")}
              {mode === "sign-up" && (submitting ? "Creating account…" : "Create account")}
              {mode === "reset" && (submitting ? "Sending…" : "Send reset link")}
            </button>
          </form>

          <div className="mt-6 flex justify-between font-body text-xs text-ink/50 lg:mt-8">
            {mode === "sign-in" ? (
              <>
                <button onClick={() => { setMode("sign-up"); setMessage(null); }}>
                  Create an account
                </button>
                <button onClick={() => { setMode("reset"); setMessage(null); }}>
                  Forgot password?
                </button>
              </>
            ) : (
              <button onClick={() => { setMode("sign-in"); setMessage(null); }}>
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
