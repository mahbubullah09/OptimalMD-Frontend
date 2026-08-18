import type { Metadata } from "next";
import { ASSETS, ORG } from "@/lib/site";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

/** Reassurance copy for the brand panel. Deliberately short — this is a sign-in
    page, not a landing page, and anything longer competes with the form. */
const POINTS = [
  { title: "Edit what you see", body: "Change any text or image and watch the page update beside you." },
  { title: "Publish when ready", body: "Nothing reaches the live site until you press Publish." },
  { title: "SEO built in", body: "Titles, descriptions and schema markup live with the content." },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Only allow same-origin redirects, so `?next=` cannot be used to bounce
  // someone to an external site after signing in.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  return (
    <div className="login">
      {/* The brand side carries the identity so the form side can stay plain;
          on narrow screens it collapses to a header strip rather than
          pushing the form below the fold. */}
      <aside className="loginBrand">
        <div className="loginBrandInner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="loginLogo" src={ASSETS.logo} alt={ORG.name} />

          <h1>
            The content behind
            <br />
            <span className="gt">{ORG.name}</span>
          </h1>

          <ul className="loginPoints">
            {POINTS.map((point) => (
              <li key={point.title}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <div>
                  <strong>{point.title}</strong>
                  <span>{point.body}</span>
                </div>
              </li>
            ))}
          </ul>

          <p className="loginLegal">
            {ORG.legalName} · Authorised access only
          </p>
        </div>
      </aside>

      <main className="loginPanel">
        <div className="loginCard">
          <h2>Sign in</h2>
          <p className="sub">Manage site content and SEO.</p>

          <LoginForm next={target} />
        </div>
      </main>
    </div>
  );
}
