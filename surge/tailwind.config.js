/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#150a26", // text, borders, hard shadows
        cream: "#fffaf2", // sticker cards
        flavor: "var(--bg)", // current flavor color (changes with selection)
        deep: "var(--deep)", // current flavor accent
      },
      fontFamily: {
        display: ["Unbounded", "'Arial Black'", "sans-serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
