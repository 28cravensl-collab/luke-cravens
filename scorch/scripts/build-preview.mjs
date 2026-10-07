// Bundles the landing page into preview-dist/ as a static page:
//   index.html (inlined Tailwind CSS) + app.js (React, three, GSAP, Framer Motion).
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const out = "preview-dist";
mkdirSync(out, { recursive: true });

await build({
  entryPoints: ["preview/main.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  jsx: "automatic",
  loader: { ".js": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: `${out}/app.js`,
});

execSync(`npx tailwindcss -i app/globals.css -o ${out}/app.css --minify`, { stdio: "inherit" });
const css = readFileSync(`${out}/app.css`, "utf8");

writeFileSync(
  `${out}/index.html`,
  `<title>Scorch Sauce Co.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Familjen+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>${css}</style>
<div id="root"></div>
<script src="app.js"></script>
`
);
console.log("Preview built in", out);
