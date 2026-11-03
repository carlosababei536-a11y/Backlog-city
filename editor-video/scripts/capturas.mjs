// Renderiza fotogramas sueltos de una composición para revisarlos (un solo bundle).
// Uso: node scripts/capturas.mjs <composición> <carpeta-salida> <fotograma> [fotograma...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [, , id = "Guion5", out = "out/capturas", ...frames] = process.argv;
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const f of frames.map(Number)) {
  const output = path.join(out, `f${String(f).padStart(5, "0")}.png`);
  await renderStill({ serveUrl, composition, frame: f, output, browserExecutable, scale: 0.5 });
  console.log(output);
}
