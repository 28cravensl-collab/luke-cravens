/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        coal: "#0c0806", // warm near-black page ground
        char: "#17110d", // raised surfaces
        flame: "#ff5a00", // brand orange
        ember: "#ff9a52", // secondary warm orange
        bone: "#f6e7d6", // text
      },
      fontFamily: {
        display: ["'Big Shoulders Display'", "Impact", "'Arial Narrow'", "sans-serif"],
        sans: ["'Familjen Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
