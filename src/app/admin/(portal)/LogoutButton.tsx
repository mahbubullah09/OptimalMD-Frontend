"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** A door with an arrow leaving it — the conventional sign-out mark. */
const SignOutIcon = () => (
  <svg
    className="navIcon"
    viewBox="0 0 24 24"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" />
    <path d="M10 8 6 12l4 4" />
    <path d="M6 12h9" />
  </svg>
);

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="btn btnGhost logoutButton"
      title="Sign out"
      onClick={signOut}
      disabled={pending}
    >
      {/* The icon carries the meaning once the sidebar collapses and the
          label is hidden, so the button is never a blank square. */}
      <SignOutIcon />
      <span className="navText">{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
