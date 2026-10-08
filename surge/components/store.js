import { useSyncExternalStore } from "react";

// Each flavor drives the page color, the tablet tint and the fruit floating behind it.
export const FLAVORS = [
  {
    id: "citrus",
    name: "Citrus Rush",
    fruit: "citrus",
    fruitLabel: "Blood orange + Meyer lemon",
    bg: "#ffb02e",
    deep: "#ff5a1f",
    tab: "#ffb866",
    speck: "#ff7a1a",
    tagline: "Bright, sharp, wakes you up.",
  },
  {
    id: "melon",
    name: "Watermelon Lime",
    fruit: "melon",
    fruitLabel: "Watermelon + Key lime",
    bg: "#ff7393",
    deep: "#e0124f",
    tab: "#ff9fb6",
    speck: "#ff2f63",
    tagline: "Summer in a glass, minus the sugar.",
  },
  {
    id: "berry",
    name: "Blue Razz",
    fruit: "berry",
    fruitLabel: "Raspberry + Wild blueberry",
    bg: "#7b98ff",
    deep: "#2338e0",
    tab: "#9fb2ff",
    speck: "#3d55ff",
    tagline: "The fan favorite. Tart, then sweet.",
  },
  {
    id: "mango",
    name: "Mango Passion",
    fruit: "mango",
    fruitLabel: "Ataulfo mango + Passionfruit",
    bg: "#ffd43b",
    deep: "#ff8a00",
    tab: "#ffd95c",
    speck: "#ffa600",
    tagline: "Tropical and smooth. Tastes like vacation.",
  },
];

export const PACKS = [
  { id: "tube", name: "Single tube", detail: "10 tabs · 1 flavor", price: 14, per: "1.40" },
  { id: "trio", name: "Flavor trio", detail: "30 tabs · pick 3", price: 36, per: "1.20", tag: "Most popular" },
  { id: "sub", name: "Monthly crew", detail: "40 tabs · all 4 flavors", price: 42, per: "1.05", tag: "Save 25%" },
];

// Per-tab nutrition (concept product). %DV based on FDA daily values.
export const NUTRITION = [
  { name: "Protein", amount: "3 g", dv: 6, from: "Whey isolate + collagen peptides", why: "Supports muscle repair while you rehydrate." },
  { name: "Sodium", amount: "300 mg", dv: 13, from: "Sodium citrate", why: "The main electrolyte lost in sweat. Helps you hold onto water." },
  { name: "Potassium", amount: "200 mg", dv: 4, from: "Potassium bicarbonate", why: "Balances sodium and keeps muscles firing." },
  { name: "Magnesium", amount: "60 mg", dv: 14, from: "Magnesium glycinate", why: "Helps head off cramps after long efforts." },
  { name: "Calcium", amount: "50 mg", dv: 4, from: "Calcium lactate", why: "Needed for every muscle contraction." },
  { name: "Vitamin C", amount: "90 mg", dv: 100, from: "Ascorbic acid", why: "Your full daily amount, plus the fizz." },
];

// Mutable pose shared between GSAP (writes) and the 3D scene (reads every frame).
export const pose = { x: 1.7, y: 0, scale: 1, spin: 0, fizz: 0.35, fruitY: 0 };

let state = { flavor: 0, cart: 0 };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l));

export const setFlavor = (flavor) => { state = { ...state, flavor }; emit(); };
export const addToCart = (n = 1) => { state = { ...state, cart: state.cart + n }; emit(); };
export const getState = () => state;
export const useStore = (sel) => useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
