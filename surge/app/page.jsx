"use client";

import dynamic from "next/dynamic";

// The page is driven by WebGL and scroll APIs, so it renders on the client only.
const Landing = dynamic(() => import("../components/Landing"), { ssr: false });

export default function Page() {
  return <Landing />;
}
