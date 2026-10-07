import { useSyncExternalStore } from "react";

export const FLAVORS = [
  {
    id: "habanero",
    no: "No. 01",
    name: "Smoked Habanero",
    sauce: "#ff5a00",
    deep: "#7a1800",
    pepper: "Habanero",
    shu: "100,000–350,000",
    heat: 4,
    price: 14,
    notes: ["Applewood smoke", "Charred onion", "Key lime"],
    pairs: "Fish tacos, grilled corn, a cold lager",
    blurb: "Our first bottle and still the loudest. Bright fruit up front, a slow smoke finish.",
  },
  {
    id: "ghost",
    no: "No. 02",
    name: "Ghost Pepper Mango",
    sauce: "#ff9d0a",
    deep: "#9a3400",
    pepper: "Bhut jolokia",
    shu: "855,000–1,041,427",
    heat: 5,
    price: 16,
    notes: ["Ataulfo mango", "Toasted cumin", "Raw agave"],
    pairs: "Wings, pork belly, anything you want to regret",
    blurb: "Sweet for three seconds, then the ghost shows up. Use a toothpick, not a spoon.",
  },
  {
    id: "garlic",
    no: "No. 03",
    name: "Black Garlic Chili Crisp",
    sauce: "#4a1408",
    deep: "#120402",
    pepper: "Chile de árbol",
    shu: "15,000–30,000",
    heat: 2,
    price: 15,
    notes: ["Aged black garlic", "Fried shallot", "Sesame"],
    pairs: "Noodles, fried eggs, vanilla ice cream (trust us)",
    blurb: "Crunchy, savory, almost sweet. The jar people finish standing at the fridge.",
  },
  {
    id: "chipotle",
    no: "No. 04",
    name: "Chipotle Honey",
    sauce: "#c2410c",
    deep: "#4c1404",
    pepper: "Chipotle morita",
    shu: "2,500–8,000",
    heat: 1,
    price: 13,
    notes: ["Wildflower honey", "Morita smoke", "Orange zest"],
    pairs: "Fried chicken, biscuits, roasted carrots",
    blurb: "The gateway sauce. Smoky, sticky and gentle enough for the whole table.",
  },
];

// Mutable jar pose: GSAP tweens these numbers, the 3D scene reads them every frame.
export const jarPose = { x: 2, y: -0.1, rotY: 0, scale: 1, tilt: 0 };

// Tiny external store for the selected flavor and cart count.
let state = { flavor: 0, cart: 0 };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l));

export const setFlavor = (flavor) => { state = { ...state, flavor }; emit(); };
export const addToCart = () => { state = { ...state, cart: state.cart + 1 }; emit(); };
export const getState = () => state;
export const useStore = (sel) => useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
