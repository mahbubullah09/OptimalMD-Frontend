"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not sign in");
        setPending(false);
        return;
      }

      // Refresh so the server re-reads the new cookie before navigating.
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error. Check that the site is still running.");
      setPending(false);
    }
  }

  /** Caps Lock is the most common cause of a password that "should" work. */
  const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <form onSubmit={onSubmit} noValidate>
      {error ? (
        <div className="alert alertError" role="alert">
          <svg viewBox="0 0 24 24" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5M12 16.2v.1" />
          </svg>
          <span>{error}</span>
        </div>
      ) : null}

      <label className="field">
        <span>Email</span>
        <span className="inputWithAction">
          <svg className="inputIcon" viewBox="0 0 24 24" strokeWidth="1.7" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m3.5 7.5 8.5 6 8.5-6" />
          </svg>
          <input
            className="input hasIcon"
            type="email"
            name="email"
            placeholder="you@optimalmd.com"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </span>
      </label>

      <label className="field">
        <span>Password</span>
        {/* The toggle sits inside the field rather than beside it, so the
            input keeps the full width the email field has. */}
        <span className="inputWithAction">
          <svg className="inputIcon" viewBox="0 0 24 24" strokeWidth="1.7" aria-hidden>
            <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
            <path d="M8.2 10V7.6a3.8 3.8 0 0 1 7.6 0V10" />
          </svg>
          <input
            className="input hasIcon"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={trackCapsLock}
            onKeyDown={trackCapsLock}
            onBlur={() => setCapsLock(false)}
            disabled={pending}
          />
          <button
            type="button"
            className="inputAction"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            disabled={pending}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8" />
                <path d="M9.4 5.2A9.5 9.5 0 0 1 12 4.9c5 0 9 4.6 9 7.1a10.9 10.9 0 0 1-2.4 3.6M6.3 6.9A11.7 11.7 0 0 0 3 12c0 2.5 4 7.1 9 7.1a9.9 9.9 0 0 0 3.4-.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M3 12s3.6-7.1 9-7.1 9 4.6 9 7.1-3.6 7.1-9 7.1S3 14.5 3 12Z" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
            )}
          </button>
        </span>
        {capsLock ? (
          <small className="fieldWarn" role="status">
            Caps Lock is on.
          </small>
        ) : null}
      </label>

      <button className="btn btnPrimary btnLg" type="submit" disabled={pending}>
        {pending ? (
          <>
            <span className="spinner" aria-hidden />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
