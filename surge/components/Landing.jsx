"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TabletScene from "./TabletScene";
import { FLAVORS, NUTRITION, PACKS, addToCart, pose, setFlavor, useStore } from "./store";

gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const ease = [0.16, 1, 0.3, 1];
const sticker = "rounded-[28px] border-[3px] border-ink bg-cream shadow-[6px_6px_0_#150a26]";

/* ---------- shared bits ---------- */

function Magnetic({ children, className = "", as = "a", ...rest }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 14 });
  const sy = useSpring(y, { stiffness: 250, damping: 14 });
  const Comp = as === "button" ? motion.button : motion.a;
  return (
    <Comp
      {...rest}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
    >
      {children}
    </Comp>
  );
}

function Spark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 0l2.6 8.4L24 12l-9.4 3.6L12 24l-2.6-8.4L0 12l9.4-3.6z" />
    </svg>
  );
}

function Stars() {
  return (
    <span className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => <Spark key={i} className="h-4 w-4" />)}
    </span>
  );
}

/* ---------- nav ---------- */

function Nav() {
  const cart = useStore((s) => s.cart);
  return (
    <motion.header
      initial={{ y: -90 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease, delay: 0.3 }}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 pb-3 pt-[calc(0.9rem+env(safe-area-inset-top,0px))] md:px-10"
    >
      <a href="#top" className="font-display text-xl font-black tracking-tight md:text-2xl">
        SURGE<span className="text-deep">+</span>
      </a>
      <nav className="hidden items-center gap-1 rounded-full border-[3px] border-ink bg-cream px-2 py-1.5 font-bold md:flex">
        {[["How it works", "#how"], ["Science", "#science"], ["Flavors", "#flavors"], ["Inside", "#inside"]].map(([l, h]) => (
          <a key={h} href={h} className="rounded-full px-4 py-1.5 text-sm transition-colors hover:bg-ink hover:text-cream">{l}</a>
        ))}
      </nav>
      <a href="#flavors" className="flex items-center gap-2 rounded-full border-[3px] border-ink bg-ink px-4 py-2 text-sm font-bold text-cream">
        Cart
        <span className="relative grid h-6 min-w-6 place-items-center overflow-hidden rounded-full bg-flavor px-1.5 text-ink">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={cart} initial={{ y: 14, scale: 0.5 }} animate={{ y: 0, scale: 1 }} exit={{ y: -14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}>
              {cart}
            </motion.span>
          </AnimatePresence>
        </span>
      </a>
    </motion.header>
  );
}

/* ---------- hero ---------- */

function FlavorDots({ className = "" }) {
  const active = useStore((s) => s.flavor);
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="radiogroup" aria-label="Flavor">
      {FLAVORS.map((f, i) => (
        <motion.button
          key={f.id}
          role="radio"
          aria-checked={i === active}
          onClick={() => setFlavor(i)}
          whileTap={{ scale: 0.92 }}
          className={`flex items-center gap-2 rounded-full border-[3px] border-ink py-1.5 pl-1.5 pr-4 text-sm font-bold transition-colors ${i === active ? "bg-ink text-cream" : "bg-cream text-ink hover:bg-white"}`}
        >
          <span className="h-6 w-6 rounded-full border-2 border-ink" style={{ background: `linear-gradient(135deg, ${f.bg}, ${f.deep})` }} />
          {f.name}
        </motion.button>
      ))}
    </div>
  );
}

const HEADLINE = [["Hydration"], ["that", "builds"], ["muscle."]];

function Hero() {
  let wi = 0;
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-center px-4 pb-12 pt-28 md:px-10">
      <div className="relative z-10 max-w-3xl">
        <motion.p className="mb-5 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-cream px-4 py-1.5 text-sm font-bold"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.4 }}>
          <Stars /> 4.9 from 12,400+ athletes
        </motion.p>
        <h1 className="font-display text-[clamp(2.7rem,7.6vw,6.6rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]">
          {HEADLINE.map((line, li) => (
            <span key={li} className="block overflow-hidden pb-1">
              {line.map((w) => {
                const i = wi++;
                const accent = w === "builds";
                return (
                  <motion.span key={w} className={`mr-[0.22em] inline-block ${accent ? "text-cream [-webkit-text-stroke:3px_#150a26] [paint-order:stroke_fill]" : ""}`}
                    initial={{ y: "110%", rotate: 6 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.09 }}>
                    {w}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>
        <motion.p className="mt-6 max-w-md text-lg font-medium md:text-xl"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.7 }}>
          One fizzing tab. <b>610 mg of electrolytes</b>, <b>3 g of protein</b>, <b>zero sugar</b>. Drop it in water and go.
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.85 }}>
          <Magnetic href="#flavors" className="inline-flex items-center gap-3 rounded-full border-[3px] border-ink bg-ink px-7 py-4 font-display text-base font-bold uppercase text-cream shadow-[5px_5px_0_#fffaf2]">
            Get 10 tabs · $14 <span aria-hidden="true">→</span>
          </Magnetic>
          <a href="#how" className="font-bold underline decoration-[3px] underline-offset-[6px] hover:decoration-deep">See how it works</a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.1 }}>
          <p className="mb-3 mt-10 font-mono text-xs font-medium uppercase tracking-[0.2em]">Pick a flavor</p>
          <FlavorDots />
        </motion.div>
      </div>
    </section>
  );
}

function HeroWord() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[100svh] overflow-hidden" aria-hidden="true">
      <motion.p className="hero-word absolute -bottom-[3vw] right-[-2vw] select-none font-display text-[26vw] font-black uppercase leading-none tracking-[-0.05em] text-white/35"
        initial={{ y: "40%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.6, ease, delay: 0.2 }}>
        Fizz
      </motion.p>
    </div>
  );
}

/* ---------- how it works ---------- */

const STEPS = [
  { word: "Drop", title: "Drop one tab in 16 oz of water.", body: "Any bottle, any glass. Cold water fizzes slower and tastes better.", stat: "16 oz", label: "of water" },
  { word: "Fizz", title: "Let it fizz for 90 seconds.", body: "Citric acid and bicarbonate do the stirring, so the protein dissolves without clumps. No shaker needed.", stat: "90 s", label: "to dissolve" },
  { word: "Drink", title: "Drink before, during or after.", body: "Replaces the sodium and potassium you sweat out, with protein to start recovery while you're still sweating.", stat: "15", label: "calories" },
];

function How() {
  return (
    <section id="how" className="relative">
      {STEPS.map((s, i) => (
        <div key={s.word} className={`step relative flex min-h-[100svh] items-center px-4 md:px-10 ${i % 2 ? "md:justify-start" : "md:justify-end"}`}>
          <span className={`step-word pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display text-[28vw] font-black uppercase leading-none text-transparent [-webkit-text-stroke:2px_rgba(21,10,38,0.18)] ${i % 2 ? "right-0" : "left-0"}`} aria-hidden="true">
            {s.word}
          </span>
          <div className={`step-card relative z-10 max-w-md p-7 md:p-9 ${sticker}`}>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-deep">Step {i + 1} of 3</p>
            <h2 className="mt-3 text-balance font-display text-3xl font-black uppercase leading-[1] md:text-4xl">{s.title}</h2>
            <p className="mt-4 text-lg">{s.body}</p>
            <div className="mt-6 flex items-baseline gap-3 border-t-[3px] border-dashed border-ink/20 pt-5">
              <span className="font-display text-5xl font-black">{s.stat}</span>
              <span className="font-bold">{s.label}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------- marquee ---------- */

function Marquee({ items, reverse = false, className = "" }) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={`overflow-hidden whitespace-nowrap border-y-[3px] border-ink py-4 ${className}`}>
      <motion.div className="inline-flex" animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }} transition={{ duration: 22, ease: "linear", repeat: Infinity }}>
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-6 pr-6 font-display text-3xl font-black uppercase md:text-5xl">
            {t} <Spark className="h-7 w-7 md:h-9 md:w-9" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- science / comparison ---------- */

// Per serving: one SURGE+ tab vs a 20 fl oz lemon-lime sports drink.
const COMPARE = [
  { label: "Sugar", unit: "g", us: 0, them: 34, max: 34, good: "low" },
  { label: "Calories", unit: "", us: 15, them: 140, max: 140, good: "low" },
  { label: "Protein", unit: "g", us: 3, them: 0, max: 3, good: "high" },
  { label: "Electrolytes", unit: "mg", us: 610, them: 345, max: 610, good: "high" },
];

function Science() {
  return (
    <section id="science" className="relative flex min-h-[100svh] items-center px-4 py-24 md:px-10">
      <div className={`relative z-10 w-full max-w-2xl p-7 md:p-10 ${sticker}`}>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-deep">The math</p>
        <h2 className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">More of what you sweat. <span className="bg-flavor px-2">None of the sugar.</span></h2>
        <p className="mt-4 text-lg">One SURGE+ tab compared with a 20 fl oz bottle of lemon-lime sports drink.</p>
        <div className="mt-8 grid gap-6">
          {COMPARE.map((c) => (
            <div key={c.label} className="compare-row">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-display text-lg font-black uppercase">{c.label}</span>
                <span className="font-mono text-sm tabular-nums">
                  <b className="text-ink">{c.us}{c.unit}</b> <span className="text-ink/50">vs {c.them}{c.unit}</span>
                </span>
              </div>
              <div className="grid gap-1.5">
                <div className="h-5 overflow-hidden rounded-full border-2 border-ink bg-white">
                  <div className="bar-us h-full rounded-full bg-ink" data-w={Math.max(2, (c.us / c.max) * 100)} style={{ width: 0 }} />
                </div>
                <div className="h-5 overflow-hidden rounded-full border-2 border-ink/25 bg-white">
                  <div className="bar-them h-full rounded-full bg-ink/20" data-w={Math.max(2, (c.them / c.max) * 100)} style={{ width: 0 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-5 text-sm font-bold">
          <span className="flex items-center gap-2"><i className="h-3 w-6 rounded-full bg-ink" />SURGE+</span>
          <span className="flex items-center gap-2 text-ink/60"><i className="h-3 w-6 rounded-full bg-ink/20" />Sports drink</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- flavors + shop ---------- */

function Shop() {
  const active = useStore((s) => s.flavor);
  const f = FLAVORS[active];
  const [pack, setPack] = useState(1);
  const [added, setAdded] = useState(false);

  const add = () => {
    addToCart(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section id="flavors" className="relative min-h-[100svh] px-4 py-28 md:px-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative z-10 md:col-start-2">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em]">4 flavors · real fruit extracts</p>
          <h2 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] md:text-7xl">Pick your<br />flavor.</h2>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {FLAVORS.map((fl, i) => (
              <motion.button key={fl.id} onClick={() => setFlavor(i)} aria-pressed={i === active}
                whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
                className={`relative overflow-hidden rounded-3xl border-[3px] border-ink p-4 text-left transition-shadow ${i === active ? "shadow-[5px_5px_0_#150a26]" : "shadow-none"}`}
                style={{ background: fl.bg }}>
                <span className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-70" style={{ background: fl.deep }} />
                <span className="relative block font-display text-lg font-black uppercase leading-tight">{fl.name}</span>
                <span className="relative mt-1 block text-sm font-medium">{fl.fruitLabel}</span>
                {i === active && (
                  <motion.span layoutId="flavor-check" className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-ink text-cream" transition={{ type: "spring", stiffness: 400, damping: 30 }}>✓</motion.span>
                )}
              </motion.button>
            ))}
          </div>

          <div className={`mt-6 p-6 ${sticker}`}>
            <AnimatePresence mode="wait">
              <motion.p key={f.id} className="font-display text-2xl font-black uppercase"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {f.tagline}
              </motion.p>
            </AnimatePresence>

            <fieldset className="mt-5 grid gap-2">
              <legend className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.2em]">Choose a pack</legend>
              {PACKS.map((p, i) => (
                <label key={p.id} htmlFor={`pack-${p.id}`}
                  className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-[3px] px-4 py-3 transition-colors ${pack === i ? "border-ink bg-flavor" : "border-ink/15 hover:border-ink/40"}`}>
                  <input id={`pack-${p.id}`} type="radio" name="pack" className="sr-only" checked={pack === i} onChange={() => setPack(i)} />
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-[3px] border-ink`}>
                    {pack === i && <motion.span layoutId="pack-dot" className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{p.name}</span>
                    <span className="block text-sm text-ink/70">{p.detail} · ${p.per}/tab</span>
                  </span>
                  {p.tag && <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-cream">{p.tag}</span>}
                  <span className="font-display text-xl font-black tabular-nums">${p.price}</span>
                </label>
              ))}
            </fieldset>

            <Magnetic as="button" onClick={add}
              className="mt-5 flex w-full items-center justify-center gap-3 overflow-hidden rounded-full border-[3px] border-ink bg-ink py-4 font-display text-lg font-black uppercase text-cream">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={added ? "y" : "n"} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {added ? "Added to cart ✓" : `Add ${PACKS[pack].name.toLowerCase()} · $${PACKS[pack].price}`}
                </motion.span>
              </AnimatePresence>
            </Magnetic>
            <p className="mt-3 text-center text-sm font-medium">Free shipping over $30 · Cancel the subscription anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- ingredients ---------- */

function DvRing({ dv }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg ref={ref} viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden="true">
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(21,10,38,0.12)" strokeWidth="8" />
      <motion.circle cx="40" cy="40" r={r} fill="none" stroke="var(--deep)" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: inView ? c * (1 - Math.min(dv, 100) / 100) : c }}
        transition={{ duration: 1.4, ease, delay: 0.2 }} />
    </svg>
  );
}

function Inside() {
  return (
    <section id="inside" className="relative bg-cream px-4 py-28 md:px-10">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="inside-title font-display text-5xl font-black uppercase leading-[0.9] md:text-7xl">What's in<br />one tab.</h2>
        <p className="max-w-sm text-lg">Six actives, all listed with the exact dose. % Daily Value is based on a 2,000-calorie diet.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NUTRITION.map((n) => (
          <motion.article key={n.name} className="inside-card group relative flex flex-col gap-5 rounded-[28px] border-[3px] border-ink bg-white p-6"
            whileHover={{ y: -6, boxShadow: "8px 8px 0 #150a26" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-2xl font-black uppercase">{n.name}</h3>
                <p className="font-mono text-sm text-ink/60">{n.from}</p>
              </div>
              <div className="relative grid shrink-0 place-items-center">
                <DvRing dv={n.dv} />
                <span className="absolute font-mono text-xs font-bold tabular-nums">{n.dv}%</span>
              </div>
            </div>
            <p className="font-display text-4xl font-black tabular-nums">{n.amount}</p>
            <p className="text-ink/80">{n.why}</p>
          </motion.article>
        ))}
      </div>
      <p className="mt-8 font-mono text-xs text-ink/60">Also in every tab: citric acid, sodium bicarbonate, natural fruit flavors, stevia leaf extract, beet juice color. Contains milk.</p>
    </section>
  );
}

/* ---------- reviews, faq, signup, footer ---------- */

const REVIEWS = [
  ["I stopped cramping at mile 18. That's never happened.", "Jess K. · marathoner"],
  ["Finally a recovery drink I don't have to shake. Drop it in, done.", "Andre M. · CrossFit coach"],
  ["Blue Razz tastes like the candy, without the crash.", "Sofia L. · soccer, D1"],
];

const FAQ = [
  ["How many tabs a day?", "One to three. Most people take one per hour of hard training, or one in the morning on rest days."],
  ["Will the protein clump?", "No. The fizz keeps the whey isolate and collagen peptides moving until they fully dissolve in about 90 seconds."],
  ["Is it vegan?", "No. The protein comes from milk (whey isolate) and bovine collagen."],
  ["Hot or cold water?", "Cold or room temperature. Hot water makes it fizz over."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="grid gap-3">
      {FAQ.map(([q, a], i) => (
        <div key={q} className="overflow-hidden rounded-3xl border-[3px] border-ink bg-cream">
          <button className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-lg font-black uppercase"
            onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {q}
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-3xl leading-none">+</motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.4, ease }}>
                <p className="px-6 pb-6 text-lg">{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function Closing() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="relative bg-cream px-4 pb-28 md:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {REVIEWS.map(([q, who], i) => (
            <motion.figure key={who} className="rounded-[28px] border-[3px] border-ink bg-flavor p-7"
              initial={{ opacity: 0, y: 50, rotate: i % 2 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease, delay: i * 0.1 }}>
              <Stars />
              <blockquote className="mt-4 font-display text-xl font-black uppercase leading-tight">“{q}”</blockquote>
              <figcaption className="mt-4 font-bold">{who}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section className="relative bg-cream px-4 pb-28 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <h2 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-6xl">Questions,<br />answered.</h2>
          <Faq />
        </div>
      </section>

      <section className="relative overflow-hidden border-y-[3px] border-ink bg-ink px-4 py-24 text-cream md:px-10">
        <div className="grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-7xl">First tube<br /><span className="text-flavor">20% off.</span></h2>
          <div>
            <p className="mb-5 max-w-md text-lg">Join the list for your code, plus early access to new flavors.</p>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.p key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="font-display text-2xl font-black uppercase text-flavor">
                  Check your inbox for the code.
                </motion.p>
              ) : (
                <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                  className="flex max-w-md overflow-hidden rounded-full border-[3px] border-cream">
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input id="email" type="email" required placeholder="you@email.com" className="min-w-0 flex-1 bg-transparent px-5 py-3 font-medium placeholder:text-cream/50 focus:outline-none" />
                  <motion.button whileTap={{ scale: 0.95 }} className="bg-flavor px-6 font-display font-black uppercase text-ink">Get code</motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden bg-flavor px-4 pb-8 pt-12 md:px-10">
        <p className="footer-word select-none text-center font-display text-[22vw] font-black uppercase leading-[0.85] tracking-[-0.05em]" aria-hidden="true">
          SURGE<span className="text-cream [-webkit-text-stroke:4px_#150a26] [paint-order:stroke_fill]">+</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-between gap-4 text-sm font-bold">
          <span>© 2026 SURGE+ · a concept brand</span>
          <span>These statements have not been evaluated by the FDA.</span>
        </div>
      </footer>
    </>
  );
}

/* ---------- scroll choreography ---------- */

const POSES = [
  { x: 2.0, y: -0.1, scale: 1, spin: 0, fizz: 0.35, fruitY: 0 }, // hero
  { x: -2.0, y: 0.5, scale: 1.1, spin: Math.PI, fizz: 0.2, fruitY: -0.6 }, // drop
  { x: 2.0, y: 0, scale: 1.15, spin: Math.PI * 2, fizz: 1, fruitY: -1.2 }, // fizz
  { x: -2.0, y: -0.2, scale: 0.3, spin: Math.PI * 3, fizz: 1, fruitY: -1.8 }, // drink: the tab has dissolved
  { x: 2.6, y: 0, scale: 0.85, spin: Math.PI * 4, fizz: 0.5, fruitY: -0.6 }, // science
  { x: -2.0, y: -0.25, scale: 1.1, spin: Math.PI * 5, fizz: 0.45, fruitY: 0 }, // flavors
];

function useScrollStory(canvasWrap) {
  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".bar-us, .bar-them").forEach((b) => (b.style.width = `${b.dataset.w}%`));
      return;
    }
    const ctx = gsap.context(() => {
      const triggers = gsap.utils.toArray(".step").concat(["#science", "#flavors"]);
      triggers.forEach((el, i) => {
        gsap.fromTo(pose, { ...POSES[i] }, {
          ...POSES[i + 1],
          ease: "power2.inOut",
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top bottom", end: i === triggers.length - 1 ? "top -10%" : "top 15%", scrub: 1.2 },
        });
      });

      gsap.to(".hero-word", {
        yPercent: -40, ease: "none",
        scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray(".step").forEach((st, i) => {
        gsap.fromTo(st.querySelector(".step-word"), { xPercent: i % 2 ? 20 : -20 }, {
          xPercent: i % 2 ? -10 : 10, ease: "none",
          scrollTrigger: { trigger: st, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.from(st.querySelector(".step-card"), {
          y: 140, rotate: i % 2 ? -6 : 6, opacity: 0, ease: "back.out(1.4)",
          scrollTrigger: { trigger: st, start: "top 80%", end: "top 25%", scrub: 1 },
        });
      });

      gsap.utils.toArray(".compare-row").forEach((row) => {
        row.querySelectorAll(".bar-us, .bar-them").forEach((bar, j) => {
          gsap.to(bar, {
            width: `${bar.dataset.w}%`, ease: "power3.out", duration: 1.4, delay: j * 0.15,
            scrollTrigger: { trigger: row, start: "top 85%" },
          });
        });
      });

      gsap.matchMedia().add("(max-width: 767px)", () => {
        gsap.to(canvasWrap.current, {
          opacity: 0.35, ease: "none",
          scrollTrigger: { trigger: "#how", start: "top 80%", end: "top 20%", scrub: true },
        });
      });
      gsap.to(canvasWrap.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: "#inside", start: "top 95%", end: "top 40%", scrub: true },
      });

      gsap.from(".inside-title", { y: 80, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: "#inside", start: "top 75%" } });
      gsap.from(".inside-card", { y: 70, opacity: 0, rotate: 3, duration: 1, stagger: 0.08, ease: "back.out(1.5)", scrollTrigger: { trigger: ".inside-card", start: "top 85%" } });
      gsap.from(".footer-word", { yPercent: 60, ease: "none", scrollTrigger: { trigger: ".footer-word", start: "top bottom", end: "bottom bottom", scrub: true } });
    });
    return () => ctx.revert();
  }, []);
}

// The page background follows the selected flavor.
function useFlavorTheme() {
  const flavor = useStore((s) => s.flavor);
  useEffect(() => {
    const f = FLAVORS[flavor];
    document.documentElement.style.setProperty("--bg", f.bg);
    document.documentElement.style.setProperty("--deep", f.deep);
  }, [flavor]);
}

export default function Landing() {
  const canvasWrap = useRef(null);
  useScrollStory(canvasWrap);
  useFlavorTheme();

  return (
    <MotionConfig reducedMotion="user">
      <div className="texture" aria-hidden="true" />
      <HeroWord />
      <motion.div ref={canvasWrap} className="pointer-events-none fixed inset-0 z-[5]"
        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease, delay: 0.2 }}>
        <TabletScene />
      </motion.div>
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main className="relative z-10 overflow-x-clip">
        <Hero />
        <How />
        <Marquee className="-rotate-2 bg-ink text-cream" items={["Zero sugar", "3 g protein", "610 mg electrolytes", "15 calories"]} />
        <Science />
        <Shop />
        <Marquee reverse className="rotate-1 bg-cream" items={FLAVORS.map((f) => f.name)} />
        <Inside />
        <Closing />
      </main>
    </MotionConfig>
  );
}
