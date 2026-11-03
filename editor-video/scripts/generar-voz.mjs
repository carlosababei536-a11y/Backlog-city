// Genera una voz PROVISIONAL con espeak-ng a partir de narracion.json,
// con el instante exacto de inicio de cada palabra (eventos del sintetizador).
// Uso: node scripts/generar-voz.mjs src/guion5/narracion.json public/guion5
// Salida: <dir>/voz-bruta.wav y <dir>/palabras-brutas.json (formato Caption de @remotion/captions)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [, , narracionPath = "src/guion5/narracion.json", outDir = "public/guion5"] = process.argv;
const narr = JSON.parse(readFileSync(narracionPath, "utf8"));
mkdirSync(outDir, { recursive: true });

const bin = path.resolve("scripts/tts/espeak_palabras");
if (!existsSync(bin)) {
  execFileSync("gcc", ["-O2", "-o", bin, "scripts/tts/espeak_palabras.c", "-lespeak-ng"], { stdio: "inherit" });
}

// Texto completo: una línea por escena (el salto de línea fuerza una pausa que luego se recorta).
const tokens = []; // {texto, linea, inicio (índice de carácter, 0-based, en code points)}
let full = "";
narr.lineas.forEach((l, li) => {
  for (const t of l.texto.split(/\s+/).filter(Boolean)) {
    if (full.length && !full.endsWith("\n")) full += " ";
    tokens.push({ texto: t, linea: l.id, inicio: [...full].length });
    full += t;
  }
  full += "\n";
});

const txt = path.join(outDir, "narracion.txt");
writeFileSync(txt, full);
const wav = path.join(outDir, "voz-bruta.wav");
const { voz, velocidad, tono } = narr.voz;
const out = execFileSync(bin, [voz, String(velocidad), String(tono), txt, wav], { encoding: "utf8" });

const eventos = out.trim().split("\n").map((r) => {
  const [pos, len, ms] = r.split("\t").map(Number);
  return { pos: pos - 1, len, ms };
});

// Asignar a cada palabra el primer evento que cae dentro de su tramo de caracteres.
for (let i = 0; i < tokens.length; i++) {
  const a = tokens[i].inicio;
  const b = i + 1 < tokens.length ? tokens[i + 1].inicio : Infinity;
  const ev = eventos.find((e) => e.pos >= a && e.pos < b);
  tokens[i].ms = ev ? ev.ms : null;
}
// Rellenar huecos (si alguna palabra no tuvo evento) interpolando.
for (let i = 0; i < tokens.length; i++) {
  if (tokens[i].ms === null) {
    const prev = tokens.slice(0, i).reverse().find((t) => t.ms !== null);
    const next = tokens.slice(i + 1).find((t) => t.ms !== null);
    tokens[i].ms = Math.round(((prev?.ms ?? 0) + (next?.ms ?? (prev?.ms ?? 0) + 300)) / 2);
  }
}

const captions = tokens.map((t, i) => ({
  text: (i === 0 ? "" : " ") + t.texto,
  startMs: t.ms,
  endMs: i + 1 < tokens.length ? tokens[i + 1].ms : t.ms + 500,
  timestampMs: t.ms,
  confidence: 1,
  linea: t.linea,
}));
writeFileSync(path.join(outDir, "palabras-brutas.json"), JSON.stringify(captions, null, 1));
console.log(`palabras=${captions.length} eventos=${eventos.length} -> ${wav}`);
