"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JarScene from "./JarScene";
import { FLAVORS, addToCart, jarPose, setFlavor, useStore } from "./store";

gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const ease = [0.16, 1, 0.3, 1];

/* ---------- small pieces ---------- */

function Magnetic({ children, className = "", strength = 0.35, ...rest }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15 });
  const sy = useSpring(y, { stiffness: 220, damping: 15 });
  return (
    <motion.a
      {...rest}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.94 }}
    >
      {children}
    </motion.a>
  );
}

function Flame({ className = "" }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 0c1 6 8 9 8 18a8 8 0 0 1-16 0c0-4 2-7 4-9 0 3 1 5 3 6-1-5 0-10 1-15z" />
    </svg>
  );
}

function HeatPips({ heat }) {
  return (
    <span className="flex gap-1" aria-label={`Heat ${heat} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Flame key={i} className={`h-4 w-3 ${i < heat ? "text-flame" : "text-bone/15"}`} />
      ))}
    </span>
  );
}

/* ---------- nav ---------- */

function Nav() {
  const cart = useStore((s) => s.cart);
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease, delay: 0.4 }}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] md:px-10"
    >
      <a href="#top" className="flex items-center gap-2 font-display text-2xl font-black tracking-tight">
        <Flame className="h-6 w-5 text-flame" /> SCORCH
      </a>
      <nav className="hidden gap-8 font-mono text-xs uppercase tracking-[0.2em] text-bone/70 md:flex">
        {[["Process", "#story"], ["Sauces", "#sauces"], ["Ingredients", "#ingredients"]].map(([l, h]) => (
          <a key={h} href={h} className="group relative py-1 hover:text-bone">
            {l}
            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-flame transition-transform duration-500 group-hover:scale-x-100" />
          </a>
        ))}
      </nav>
      <a href="#sauces" className="relative flex items-center gap-2 rounded-full border border-bone/20 bg-char/60 px-4 py-2 font-mono text-xs uppercase tracking-widest backdrop-blur-md transition-colors hover:border-flame">
        Cart
        <span className="relative grid h-6 min-w-6 place-items-center overflow-hidden rounded-full bg-flame px-1.5 text-coal">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={cart}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
            >
              {cart}
            </motion.span>
          </AnimatePresence>
        </span>
      </a>
    </motion.header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-10 pt-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_45%,rgba(255,90,0,0.28),transparent_70%)]" />

      <div className="relative z-10 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div className="max-w-xl rounded-2xl bg-coal/40 p-1 backdrop-blur-[2px] md:bg-transparent md:p-0 md:backdrop-blur-0">
          <motion.p
            className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ember"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.7 }}
          >
            Small-batch · Fermented 90 days · Oaxaca × Austin
          </motion.p>
          <motion.h2
            className="text-balance font-display text-5xl font-extrabold uppercase leading-[0.9] md:text-7xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.8 }}
          >
            Heat you can taste the time in.
          </motion.h2>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1 }}
          >
            <Magnetic href="#sauces" className="inline-flex items-center gap-3 rounded-full bg-flame px-7 py-4 font-display text-lg font-bold uppercase tracking-wide text-coal shadow-[0_0_40px_rgba(255,90,0,0.45)]">
              Shop the sauces <span aria-hidden="true">→</span>
            </Magnetic>
            <a href="#story" className="font-mono text-xs uppercase tracking-[0.2em] text-bone/70 underline decoration-flame underline-offset-8 hover:text-bone">
              How we make it
            </a>
          </motion.div>
        </div>
        <motion.dl
          className="grid grid-cols-3 gap-4 border-t border-bone/15 pt-5 md:ml-auto md:w-[28rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {[["90", "days in oak"], ["7", "ingredients, max"], ["0", "preservatives"]].map(([n, l]) => (
            <div key={l}>
              <dt className="font-display text-4xl font-black text-flame">{n}</dt>
              <dd className="font-mono text-[0.65rem] uppercase tracking-widest text-bone/60">{l}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

// Giant wordmark sits behind the 3D jar, so it lives outside <main>'s stacking layer.
function HeroWord() {
  const letters = "SCORCH".split("");
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[100svh] overflow-hidden">
        <h1 className="hero-word pointer-events-none absolute inset-x-0 top-[14vh] flex select-none justify-center font-display font-black leading-[0.8] tracking-[-0.03em] text-[25vw]" aria-label="Scorch">
        {letters.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block bg-gradient-to-b from-flame via-ember to-flame/10 bg-clip-text text-transparent"
            initial={{ y: "100%", opacity: 0, rotate: 8 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.3, ease, delay: 0.1 + i * 0.07 }}
          >
            {l}
          </motion.span>
        ))}
      </h1>
    </div>
  );
}

/* ---------- process story ---------- */

const CHAPTERS = [
  { word: "Fire", title: "Charred over mesquite", body: "Every pepper goes onto a mesquite grill until the skins blister black. We lose a third of the batch to the flames and keep the flavor that survives.", stat: "480°C", statLabel: "grill surface" },
  { word: "Smoke", title: "Fourteen hours of applewood", body: "The charred peppers rest in a cold smoker overnight. Low and slow, so the smoke sinks in instead of sitting on top.", stat: "14 h", statLabel: "cold smoke" },
  { word: "Time", title: "Ninety days in oak", body: "Then we wait. A lacto-ferment in retired bourbon barrels turns sharp heat into something deep, round and a little funky.", stat: "90 d", statLabel: "barrel ferment" },
];

function Story() {
  return (
    <section id="story" className="relative">
      {CHAPTERS.map((c, i) => (
        <div key={c.word} className={`chapter relative flex min-h-[100svh] items-center px-5 md:px-10 ${i % 2 ? "md:justify-start" : "md:justify-end"}`}>
          <span className={`chapter-word pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display font-black uppercase leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,90,0,0.35)] text-[30vw] ${i % 2 ? "right-0" : "left-0"}`} aria-hidden="true">
            {c.word}
          </span>
          <div className="chapter-copy relative z-10 max-w-md rounded-3xl border border-bone/10 bg-coal/70 p-7 backdrop-blur-md md:p-9">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-ember">Step {i + 1} of 3 · {c.word}</p>
            <h3 className="mt-3 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">{c.title}</h3>
            <p className="mt-4 text-bone/75">{c.body}</p>
            <div className="mt-6 flex items-baseline gap-3 border-t border-bone/10 pt-5">
              <span className="font-display text-5xl font-black text-flame">{c.stat}</span>
              <span className="font-mono text-xs uppercase tracking-widest text-bone/50">{c.statLabel}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------- marquee ---------- */

function Marquee({ reverse = false, className = "" }) {
  const items = FLAVORS.map((f) => f.name);
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden whitespace-nowrap py-4 ${className}`}>
      <motion.div
        className="inline-flex gap-10"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-5xl font-black uppercase md:text-7xl">
            {t} <Flame className="h-8 w-6 md:h-12 md:w-9" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- product showcase ---------- */

function Showcase() {
  const active = useStore((s) => s.flavor);
  const [added, setAdded] = useState(null);

  const add = (i) => {
    addToCart();
    setAdded(i);
    setTimeout(() => setAdded((a) => (a === i ? null : a)), 1400);
  };

  return (
    <section id="sauces" className="relative min-h-[100svh] px-5 py-28 md:px-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative z-10 md:col-span-2 md:flex md:items-end md:justify-between md:gap-10">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ember">The lineup · 5 fl oz jars</p>
          <h2 className="mt-3 font-display text-6xl font-black uppercase leading-[0.85] md:text-8xl">Pick your<br /><span className="text-flame">fire.</span></h2>
          <p className="mt-5 max-w-sm text-bone/70 md:mt-0">Tap a sauce to see it in the jar. Heat is measured in Scoville heat units (SHU) of the main pepper.</p>
        </div>

        <ul className="relative z-10 flex flex-col gap-3 md:col-start-2">
          {FLAVORS.map((f, i) => {
            const open = i === active;
            return (
              <motion.li key={f.id} layout transition={{ layout: { duration: 0.5, ease } }}
                className={`overflow-hidden rounded-3xl border backdrop-blur-md transition-colors ${open ? "border-flame/60 bg-char/90" : "border-bone/10 bg-char/60 hover:border-bone/30"}`}>
                <motion.button
                  layout="position"
                  onClick={() => setFlavor(i)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 p-5 text-left md:p-6"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="h-10 w-10 shrink-0 rounded-full ring-2 ring-bone/10" style={{ background: `radial-gradient(circle at 35% 30%, ${f.sauce}, ${f.deep})` }} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-bone/50">{f.no} · {f.pepper}</span>
                    <span className="block font-display text-2xl font-extrabold uppercase md:text-3xl">{f.name}</span>
                  </span>
                  <HeatPips heat={f.heat} />
                </motion.button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease }}
                    >
                      <div className="grid gap-5 px-5 pb-6 md:px-6">
                        <p className="text-bone/75">{f.blurb}</p>
                        <div>
                          <div className="mb-2 flex justify-between font-mono text-[0.65rem] uppercase tracking-widest text-bone/50">
                            <span>Heat</span><span className="tabular-nums">{f.shu} SHU</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-bone/10">
                            <motion.div className="h-full rounded-full bg-gradient-to-r from-ember to-flame"
                              initial={{ width: 0 }} animate={{ width: `${f.heat * 20}%` }} transition={{ duration: 0.9, ease, delay: 0.15 }} />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {f.notes.map((n, j) => (
                            <motion.span key={n} className="rounded-full border border-bone/15 px-3 py-1 font-mono text-xs text-bone/80"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + j * 0.07 }}>
                              {n}
                            </motion.span>
                          ))}
                        </div>
                        <p className="font-mono text-xs text-bone/50"><span className="text-ember">Pairs with</span> — {f.pairs}</p>
                        <div className="flex items-center justify-between border-t border-bone/10 pt-5">
                          <span className="font-display text-4xl font-black tabular-nums">${f.price}</span>
                          <motion.button
                            onClick={() => add(i)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.92 }}
                            className="relative overflow-hidden rounded-full bg-flame px-6 py-3 font-display text-lg font-bold uppercase text-coal"
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span key={added === i ? "y" : "n"} className="block"
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                {added === i ? "Added ✓" : "Add to cart"}
                              </motion.span>
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- ingredients ---------- */

const INGREDIENTS = [
  { name: "Habanero", origin: "Yucatán, MX", coord: "20.97° N, 89.62° W", fact: "Picked fully orange, never green. Ripe pods carry the fruit." },
  { name: "Mesquite", origin: "Hill Country, TX", coord: "30.27° N, 98.87° W", fact: "Dead-fall wood only. It burns hotter and cleaner than fresh-cut." },
  { name: "Raw agave", origin: "Jalisco, MX", coord: "20.66° N, 103.35° W", fact: "Unfiltered nectar rounds off the bitter edge of charred skin." },
  { name: "Sea salt", origin: "Colima, MX", coord: "19.24° N, 103.72° W", fact: "Hand-raked from the Cuyutlán lagoon. Flaky, briny, a little sweet." },
  { name: "Black garlic", origin: "Gilroy, CA", coord: "37.01° N, 121.57° W", fact: "Aged six weeks at 60°C until the cloves turn soft as jam." },
  { name: "Cane vinegar", origin: "Veracruz, MX", coord: "19.17° N, 96.13° W", fact: "Fermented from sugarcane, gentler than distilled white." },
];

function Ingredients() {
  return (
    <section id="ingredients" className="relative bg-char px-5 py-28 md:px-10">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="ing-title font-display text-6xl font-black uppercase leading-[0.85] md:text-8xl">Seven things.<br /><span className="text-flame">Nothing else.</span></h2>
        <p className="max-w-sm text-bone/70">Every jar reads like a short grocery list. Here is where the main six come from. The seventh is water.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INGREDIENTS.map((ing) => (
          <motion.article key={ing.name} className="ing-card group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border border-bone/10 bg-coal p-7"
            whileHover="hover" initial="rest" animate="rest">
            <motion.span className="absolute inset-0 origin-bottom bg-flame" variants={{ rest: { scaleY: 0 }, hover: { scaleY: 1 } }} transition={{ duration: 0.5, ease }} />
            <div className="relative flex justify-between font-mono text-[0.65rem] uppercase tracking-widest text-bone/50 transition-colors duration-300 group-hover:text-coal/70">
              <span>{ing.origin}</span><span>{ing.coord}</span>
            </div>
            <div className="relative">
              <motion.h3 className="font-display text-5xl font-black uppercase transition-colors duration-300 group-hover:text-coal"
                variants={{ rest: { x: 0 }, hover: { x: 8 } }} transition={{ duration: 0.4, ease }}>
                {ing.name}
              </motion.h3>
              <p className="mt-2 text-bone/65 transition-colors duration-300 group-hover:text-coal/80">{ing.fact}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ---------- reviews + signup + footer ---------- */

const REVIEWS = [
  ["The chili crisp lives on my desk now. I put it on popcorn.", "Dana R., Portland"],
  ["Ghost Pepper Mango made my uncle cry at Thanksgiving. Five stars.", "Marco T., San Antonio"],
  ["You can actually taste the smoke. Most sauces just taste like vinegar.", "Priya S., Chicago"],
];

function Closing() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="relative px-5 py-28 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map(([q, who], i) => (
            <motion.figure key={who} className="rounded-3xl border border-bone/10 bg-char/60 p-7"
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease, delay: i * 0.1 }}>
              <div className="mb-4 flex gap-1 text-flame">{Array.from({ length: 5 }, (_, k) => <Flame key={k} className="h-4 w-3" />)}</div>
              <blockquote className="font-display text-2xl font-bold uppercase leading-tight">“{q}”</blockquote>
              <figcaption className="mt-4 font-mono text-xs uppercase tracking-widest text-bone/50">{who}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-flame px-5 py-24 text-coal md:px-10">
        <div className="grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="font-display text-6xl font-black uppercase leading-[0.85] md:text-8xl">Join the<br />burn list.</h2>
          <div>
            <p className="mb-5 max-w-md font-medium">One email when a new batch comes out of the barrel. Limited runs usually sell out in a weekend.</p>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.p key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-black uppercase">
                  You're on the list.
                </motion.p>
              ) : (
                <motion.form key="form" exit={{ opacity: 0, y: -10 }} onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                  className="flex max-w-md overflow-hidden rounded-full border-2 border-coal">
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input id="email" type="email" required placeholder="you@email.com"
                    className="min-w-0 flex-1 bg-transparent px-5 py-3 font-mono text-sm placeholder:text-coal/50 focus:outline-none" />
                  <motion.button whileTap={{ scale: 0.95 }} className="bg-coal px-6 font-display text-lg font-bold uppercase text-flame">Sign up</motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden px-5 pb-8 pt-16 md:px-10">
        <p className="footer-word select-none text-center font-display font-black uppercase leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(255,90,0,0.5)] text-[25vw]" aria-hidden="true">
          Scorch
        </p>
        <div className="mt-8 flex flex-wrap justify-between gap-4 font-mono text-xs uppercase tracking-widest text-bone/50">
          <span>© 2026 Scorch Sauce Co. — a concept brand</span>
          <span>Made in small batches. Eat responsibly.</span>
        </div>
      </footer>
    </>
  );
}

/* ---------- scroll choreography ---------- */

// Where the jar sits as each section scrolls into place.
const POSES = [
  { x: 1.9, y: -0.15, rotY: 0, scale: 1, tilt: 0 }, // hero
  { x: -1.9, y: 0, rotY: Math.PI, scale: 1.05, tilt: 0.1 }, // fire
  { x: 1.9, y: 0.05, rotY: Math.PI * 2, scale: 1.1, tilt: -0.08 }, // smoke
  { x: -1.9, y: -0.05, rotY: Math.PI * 3, scale: 1.15, tilt: 0.05 }, // time
  { x: -1.85, y: -0.45, rotY: Math.PI * 4, scale: 1.05, tilt: 0 }, // showcase
];

function useScrollStory(canvasWrap) {
  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray(".chapter").concat("#sauces");
      steps.forEach((el, i) => {
        gsap.fromTo(jarPose, { ...POSES[i] }, {
          ...POSES[i + 1],
          ease: "power2.inOut",
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top bottom", end: i === steps.length - 1 ? "top -10%" : "top 15%", scrub: 1.2 },
        });
      });

      gsap.to(".hero-word", {
        yPercent: 35, opacity: 0.15, ease: "none",
        scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray(".chapter").forEach((ch, i) => {
        gsap.fromTo(ch.querySelector(".chapter-word"), { xPercent: i % 2 ? 25 : -25 }, {
          xPercent: i % 2 ? -10 : 10, ease: "none",
          scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.from(ch.querySelector(".chapter-copy"), {
          y: 120, opacity: 0, rotate: i % 2 ? -3 : 3, ease: "power3.out",
          scrollTrigger: { trigger: ch, start: "top 75%", end: "top 25%", scrub: 1 },
        });
      });

      gsap.to(canvasWrap.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: "#ingredients", start: "top 90%", end: "top 30%", scrub: true },
      });

      gsap.from(".ing-title", {
        y: 80, opacity: 0, duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: "#ingredients", start: "top 75%" },
      });
      gsap.from(".ing-card", {
        y: 60, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: ".ing-card", start: "top 85%" },
      });
      gsap.fromTo(".footer-word", { letterSpacing: "0.2em", opacity: 0 }, {
        letterSpacing: "-0.03em", opacity: 1, ease: "none",
        scrollTrigger: { trigger: ".footer-word", start: "top bottom", end: "bottom bottom", scrub: true },
      });
    });
    return () => ctx.revert();
  }, []);
}

export default function Landing() {
  const canvasWrap = useRef(null);
  useScrollStory(canvasWrap);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grain" aria-hidden="true" />
      <motion.div
        ref={canvasWrap}
        className="pointer-events-none fixed inset-0 z-[5]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease, delay: 0.3 }}
      >
        <JarScene />
      </motion.div>
      <HeroWord />
      <Nav />
      <main className="relative z-10 overflow-x-clip">
        <Hero />
        <Story />
        <div className="relative -rotate-2 bg-flame text-coal"><Marquee /></div>
        <Showcase />
        <div className="relative rotate-1 border-y border-flame/40 bg-coal text-flame"><Marquee reverse /></div>
        <Ingredients />
        <Closing />
      </main>
    </MotionConfig>
  );
}
