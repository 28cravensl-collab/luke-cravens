# Scorch Sauce Co.

A premium landing page for a concept gourmet hot-sauce brand, with a real-time 3D sauce jar.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · React Three Fiber + drei · GSAP ScrollTrigger · Framer Motion

## Run it

```bash
cd scorch
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

`npm run preview:build` also bundles the same page into `preview-dist/` as a plain static page (no Next server), used for the hosted preview.

## What's on the page

| Section | Motion |
| --- | --- |
| Hero | Oversized wordmark rises letter by letter behind the 3D jar; magnetic CTA |
| 3D jar | Glass with physical transmission and clearcoat, sauce with floating seeds, knurled metal lid, label drawn to a canvas texture, rising steam shader, 220 orbiting spice flakes, a key light that follows the pointer, flickering ember light |
| Process (Fire · Smoke · Time) | GSAP ScrollTrigger scrubs the jar from side to side and spins it as each step scrolls in; outlined background words parallax |
| Marquees | Rotated infinite flavor bands (Framer Motion) |
| Pick your fire | Choosing a sauce re-colors the jar and repaints its label; animated heat meter in Scoville units; add-to-cart button and cart badge animations |
| Ingredients | Staggered reveal; tiles flood orange on hover |
| Reviews, newsletter, footer | In-view reveals, form success state, scrubbed footer wordmark |

Respects `prefers-reduced-motion` (scroll choreography and Framer animations switch off).

## Files

- `components/JarScene.jsx` — the R3F scene (jar, steam, spices, lights, environment)
- `components/Landing.jsx` — page sections and GSAP scroll choreography
- `components/store.js` — flavor data, jar pose shared between GSAP and the 3D scene, cart state
- `app/` — Next.js layout, page and global styles
