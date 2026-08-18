"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <button type="button" className="btn btnGhost" onClick={signOut} disabled={pending} style={{ width: "100%", color: "#e6eefb", borderColor: "rgba(255,255,255,.18)" }}>
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
