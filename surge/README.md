# SURGE+ Hydration

Landing page for a concept electrolyte + protein fizzing tablet, with a real-time 3D tablet, fizz and fruit.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · React Three Fiber + drei · GSAP ScrollTrigger · Framer Motion

## Run it

```bash
cd surge
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

`npm run preview:build` bundles the same page into `preview-dist/` as a plain static page (used for the hosted preview).

## What's on the page

| Section | Motion |
| --- | --- |
| Hero | Headline words rise in; magnetic CTA; flavor chips recolor the whole page, the tablet and the fruit |
| 3D scene | Speckled compressed-powder tablet with embossed logo and score line, rising fizz bubbles, a looping water splash, and real-fruit pieces per flavor (citrus slices, watermelon wedges, raspberries and blueberries, mango cubes and passionfruit halves) |
| How it works (Drop · Fizz · Drink) | GSAP ScrollTrigger moves the tablet side to side, ramps up the fizz, then shrinks the tablet as it "dissolves" |
| The math | Animated bars: one tab vs a 20 fl oz sports drink (sugar, calories, protein, electrolytes) |
| Pick your flavor | Flavor cards, pack picker (single / trio / subscription), add-to-cart and cart badge animations |
| What's in one tab | Six actives with dose and an animated % Daily Value ring |
| Reviews, FAQ, signup, footer | In-view reveals, accordion, form success state |

Respects `prefers-reduced-motion`.

## Files

- `components/TabletScene.jsx` — the R3F scene (tablet, bubbles, splash, fruit, lights)
- `components/Landing.jsx` — page sections and scroll choreography
- `components/store.js` — flavors, packs, nutrition, the shared tablet pose and cart state
- `app/` — Next.js layout, page and global styles
