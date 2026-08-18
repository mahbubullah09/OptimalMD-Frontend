import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Only allow same-origin redirects, so `?next=` can't be used to bounce
  // someone to an external site after signing in.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  return (
    <div className="loginWrap">
      <div className="loginCard">
        <h1>OptimalMD Admin</h1>
        <p className="sub">Sign in to manage site content and SEO.</p>
        <LoginForm next={target} />
      </div>
    </div>
  );
}
