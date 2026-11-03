// Corta los silencios de más de N segundos de un audio o vídeo y reajusta los tiempos de las palabras.
// Uso: node scripts/cortar-silencios.mjs <entrada.(wav|mp4)> <palabras.json> <salida.(wav|mp4)> [umbral=0.3] [margen=0.12] [ruido=-35] [--modo=audio|palabras]
//  - umbral: los silencios más largos que esto se recortan (paso 3: 0,3 s)
//  - margen: segundos de aire que se dejan a cada lado de la voz (el silencio queda en 2 x margen)
//  - modo audio (por defecto): silencios medidos en el sonido con ffmpeg (bueno para voz limpia)
//  - modo palabras: huecos entre palabras de la transcripción (mejor si hay ruido o música de fondo)
//  En vídeo, cada corte se ajusta a un fotograma exacto para que imagen y sonido no se desincronicen.
// Escribe también <salida>.cortes.json (tramos conservados, en tiempo original)
// y <salida sin extensión>.palabras.json (palabras con los tiempos ya recortados).
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";

const posicionales = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const banderas = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.replace(/^--/, "").split("=")),
);
const [entrada, palabrasPath, salida, umbralArg, margenArg, ruidoArg] = posicionales;
const MODO = banderas.modo ?? "audio";
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
const flujoVideo = probe.streams.find((s) => s.codec_type === "video");
const tieneVideo = Boolean(flujoVideo);
const fpsVideo = tieneVideo ? (([n, d]) => Number(n) / Number(d || 1))(flujoVideo.r_frame_rate.split("/")) : 0;
const palabrasEntrada = JSON.parse(readFileSync(palabrasPath, "utf8"));

// 1) Detectar silencios
const silencios = [];
if (MODO === "palabras") {
  // Huecos entre el final de una palabra y el inicio de la siguiente (y antes de la primera / tras la última)
  const ps = palabrasEntrada;
  if (ps.length && ps[0].startMs / 1000 > UMBRAL) silencios.push([0, ps[0].startMs / 1000]);
  for (let i = 0; i + 1 < ps.length; i++) {
    const a = ps[i].endMs / 1000;
    const b = ps[i + 1].startMs / 1000;
    if (b - a > UMBRAL) silencios.push([a, b]);
  }
  const ult = ps.length ? ps[ps.length - 1].endMs / 1000 : 0;
  if (duracion - ult > UMBRAL) silencios.push([ult, duracion]);
}
const det = MODO === "palabras" ? { stderr: "" } : spawnSync(
  "ffmpeg",
  ["-hide_banner", "-nostats", "-i", entrada, "-af", `silencedetect=noise=${RUIDO}dB:d=${UMBRAL}`, "-f", "null", "-"],
  { encoding: "utf8" },
);
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
let conservar = [];
let t = 0;
for (const [a, b] of quitar) {
  if (a > t) conservar.push([t, a]);
  t = b;
}
if (t < duracion) conservar.push([t, duracion]);
// En vídeo: ajustar cada tramo a fotogramas exactos (si no, el audio se adelanta un poco en cada corte)
if (tieneVideo && fpsVideo > 0) {
  const q = (x) => Math.round(x * fpsVideo) / fpsVideo;
  conservar = conservar.map(([a, b]) => [q(a), Math.min(q(b), Math.floor(duracion * fpsVideo) / fpsVideo)]).filter(([a, b]) => b - a >= 1 / fpsVideo);
}

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
const palabras = palabrasEntrada.map((p) => ({
  ...p,
  startMs: Math.round(mapa(p.startMs / 1000) * 1000),
  endMs: Math.round(mapa(p.endMs / 1000) * 1000),
  timestampMs: p.timestampMs === null ? null : Math.round(mapa(p.timestampMs / 1000) * 1000),
}));
const base = salida.replace(/\.[^.]+$/, "");
writeFileSync(`${base}.palabras.json`, JSON.stringify(palabras, null, 1));
writeFileSync(`${salida}.cortes.json`, JSON.stringify({ modo: MODO, umbral: UMBRAL, margen: MARGEN, ruido: RUIDO, silencios, quitar, conservar }, null, 1));

const nuevaDur = conservar.reduce((s, [a, b]) => s + b - a, 0);
console.log(
  `silencios>${UMBRAL}s: ${silencios.length} | quitado ${(duracion - nuevaDur).toFixed(2)} s | ${duracion.toFixed(2)} s -> ${nuevaDur.toFixed(2)} s`,
);
