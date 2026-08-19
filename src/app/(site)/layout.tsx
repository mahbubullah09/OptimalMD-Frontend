import type { Metadata } from "next";
import Footer from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";
import { getGlobals } from "@/lib/globals";

const OG_IMAGE =
  "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a406189d50c4ff1841c7847.png";

export const metadata: Metadata = {
  title: {
    absolute: "OptimalMD | Healthcare Made Affordable: $0 Doctor Visits, Medications & Labs",
  },
  description:
    "OptimalMD is a private healthcare network with unlimited $0 virtual doctor visits, 1,100+ $0 medications, 3,900+ $0 lab tests, and $0 licensed therapists. No deductibles, no copays, no insurance required. Plans from $149/month for up to 7 family members.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "OptimalMD | Healthcare Made Affordable",
    description:
      "Unlimited $0 virtual care, medications, and labs, no insurance middlemen, no deductibles, no copays. Up to 7 family members from $149/month.",
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "OptimalMD | Healthcare Made Affordable",
    description: "Unlimited $0 virtual care, medications, and labs, no insurance required.",
    images: [OG_IMAGE],
  },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Falls back to the transcribed defaults if the API is unreachable, so the
  // header and footer render either way.
  const { nav, footer } = await getGlobals();

  return (
    <>
      <div className="bg-texture" aria-hidden />
      <Navbar data={nav} />
      {children}
      <Footer data={footer} />
    </>
  );
}
