// Corta los silencios de más de N segundos de un audio o vídeo y reajusta los tiempos de las palabras.
// Uso: node scripts/cortar-silencios.mjs <entrada.(wav|mp4)> <palabras.json> <salida.(wav|mp4)> [umbral=0.3] [margen=0.12] [ruido=-35]
//  - umbral: los silencios más largos que esto se recortan (paso 3: 0,3 s)
//  - margen: segundos de aire que se dejan a cada lado de la voz (el silencio queda en 2 x margen)
// Escribe también <salida>.cortes.json (tramos conservados, en tiempo original)
// y <salida sin extensión>.palabras.json (palabras con los tiempos ya recortados).
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";

const [, , entrada, palabrasPath, salida, umbralArg, margenArg, ruidoArg] = process.argv;
if (!entrada || !palabrasPath || !salida) {
  console.error("uso: entrada palabras.json salida [umbral] [margen] [ruido_dB]");
  process.exit(1);
}
const UMBRAL = Number(umbralArg ?? 0.3);
const MARGEN = Number(margenArg ?? 0.12);
const RUIDO = Number(ruidoArg ?? -35);

const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-of", "json", entrada], {
    encoding: "utf8",
  }),
);
const duracion = Number(probe.format.duration);
const tieneVideo = probe.streams.some((s) => s.codec_type === "video");

// 1) Detectar silencios (ffmpeg los escribe en stderr)
const det = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-nostats", "-i", entrada, "-af", `silencedetect=noise=${RUIDO}dB:d=${UMBRAL}`, "-f", "null", "-"],
  { encoding: "utf8" },
);
const silencios = [];
let ini = null;
for (const linea of det.stderr.split("\n")) {
  const s = linea.match(/silence_start: ([\d.]+)/);
  const e = linea.match(/silence_end: ([\d.]+)/);
  if (s) ini = Number(s[1]);
  if (e && ini !== null) {
    silencios.push([ini, Number(e[1])]);
    ini = null;
  }
}
if (ini !== null) silencios.push([ini, duracion]);

// 2) Tramos a quitar: el silencio menos el margen a cada lado (al principio y al final, sin margen exterior)
const quitar = [];
for (const [a, b] of silencios) {
  const qa = a <= 0.01 ? 0 : a + MARGEN;
  const qb = b >= duracion - 0.01 ? duracion : b - MARGEN;
  if (qb - qa > 0.02) quitar.push([qa, qb]);
}
const conservar = [];
let t = 0;
for (const [a, b] of quitar) {
  if (a > t) conservar.push([t, a]);
  t = b;
}
if (t < duracion) conservar.push([t, duracion]);

// 3) Montar el archivo recortado (fundidos de 5 ms en cada unión para que no haya chasquidos)
const partes = [];
const filtros = [];
conservar.forEach(([a, b], i) => {
  const d = b - a;
  const fade = Math.min(0.005, d / 4);
  filtros.push(
    `[0:a]atrim=${a.toFixed(4)}:${b.toFixed(4)},asetpts=PTS-STARTPTS,afade=t=in:d=${fade},afade=t=out:st=${(d - fade).toFixed(4)}:d=${fade}[a${i}]`,
  );
  if (tieneVideo) filtros.push(`[0:v]trim=${a.toFixed(4)}:${b.toFixed(4)},setpts=PTS-STARTPTS[v${i}]`);
  partes.push(tieneVideo ? `[v${i}][a${i}]` : `[a${i}]`);
});
filtros.push(
  `${partes.join("")}concat=n=${conservar.length}:v=${tieneVideo ? 1 : 0}:a=1${tieneVideo ? "[v][a]" : "[a]"}`,
);
const scriptPath = `${salida}.filtro.txt`;
writeFileSync(scriptPath, filtros.join(";\n"));
const args = ["-y", "-v", "error", "-i", entrada, "-filter_complex_script", scriptPath];
if (tieneVideo) args.push("-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-c:a", "aac", "-b:a", "192k");
else args.push("-map", "[a]", "-ar", "44100", "-ac", "1");
args.push(salida);
execFileSync("ffmpeg", args, { stdio: "inherit" });
rmSync(scriptPath);

// 4) Reajustar los tiempos de las palabras al nuevo montaje
const mapa = (seg) => {
  let acumulado = 0;
  for (const [a, b] of conservar) {
    if (seg < a) return acumulado; // cae en un tramo quitado: se pega al inicio del siguiente
    if (seg <= b) return acumulado + (seg - a);
    acumulado += b - a;
  }
  return acumulado;
};
const palabras = JSON.parse(readFileSync(palabrasPath, "utf8")).map((p) => ({
  ...p,
  startMs: Math.round(mapa(p.startMs / 1000) * 1000),
  endMs: Math.round(mapa(p.endMs / 1000) * 1000),
  timestampMs: p.timestampMs === null ? null : Math.round(mapa(p.timestampMs / 1000) * 1000),
}));
const base = salida.replace(/\.[^.]+$/, "");
writeFileSync(`${base}.palabras.json`, JSON.stringify(palabras, null, 1));
writeFileSync(`${salida}.cortes.json`, JSON.stringify({ umbral: UMBRAL, margen: MARGEN, ruido: RUIDO, silencios, quitar, conservar }, null, 1));

const nuevaDur = conservar.reduce((s, [a, b]) => s + b - a, 0);
console.log(
  `silencios>${UMBRAL}s: ${silencios.length} | quitado ${(duracion - nuevaDur).toFixed(2)} s | ${duracion.toFixed(2)} s -> ${nuevaDur.toFixed(2)} s`,
);
