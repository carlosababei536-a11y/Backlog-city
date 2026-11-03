// Alinea una transcripción (Whisper) con el texto del guion: cada palabra del guion recibe el tiempo
// de la palabra que se oye y su línea (escena). Así una voz real (grabada o TTS) sustituye a la provisional.
// Uso: node scripts/alinear-guion.mjs <palabras-whisper.json> <narracion.json> <salida.json>
// - Los números se comparan en letra ("33" = "treinta y tres"), tanto en el guion como en la transcripción.
// - Alineación por programación dinámica (como un diff): tolera palabras mal oídas, de más o de menos.
import { readFileSync, writeFileSync } from "node:fs";

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

const UNI = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciseis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidos", "veintitres", "veinticuatro", "veinticinco", "veintiseis", "veintisiete", "veintiocho", "veintinueve"];
const DEC = { 30: "treinta", 40: "cuarenta", 50: "cincuenta", 60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa" };
const CEN = { 100: "cien", 200: "doscientos", 300: "trescientos", 400: "cuatrocientos", 500: "quinientos", 600: "seiscientos", 700: "setecientos", 800: "ochocientos", 900: "novecientos" };
// Número → palabras en español (0–999 999), como las diría un narrador
export const enLetra = (n) => {
  if (n < 30) return [UNI[n]];
  if (n < 100) return n % 10 ? [DEC[n - (n % 10)], "y", UNI[n % 10]] : [DEC[n]];
  if (n < 1000) {
    const c = n - (n % 100);
    if (n === 100) return ["cien"];
    const nombre = c === 100 ? "ciento" : CEN[c];
    return n % 100 ? [nombre, ...enLetra(n % 100)] : [nombre];
  }
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  return [...(miles === 1 ? [] : enLetra(miles)), "mil", ...(resto ? enLetra(resto) : [])];
};
const expandir = (palabra) => {
  const k = norm(palabra);
  return /^\d+$/.test(k) && k.length <= 6 ? enLetra(Number(k)) : k ? [k] : [];
};

// Distancia de edición normalizada entre dos palabras (0 = iguales, 1 = nada que ver)
const dist = (a, b) => {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n] / Math.max(m, n);
};

export const alinear = (whisper, narracion) => {
  // Guion: palabras con su línea, expandidas a subpalabras
  const guion = [];
  for (const l of narracion.lineas) for (const t of l.texto.split(/\s+/).filter(Boolean)) guion.push({ texto: t, linea: l.id });
  const G = guion.flatMap((g, gi) => expandir(g.texto).map((k) => ({ k, gi })));
  // Transcripción: subpalabras con el tiempo repartido dentro de cada palabra
  const W = whisper.flatMap((w) => {
    const sub = expandir(w.text);
    const d = (w.endMs - w.startMs) / Math.max(1, sub.length);
    return sub.map((k, i) => ({ k, ms: Math.round(w.startMs + i * d) }));
  });

  // Programación dinámica: coste de sustituir = distancia, de saltar = 1
  const n = G.length, m = W.length;
  const C = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const P = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1)); // 1 diag, 2 arriba, 3 izquierda
  for (let i = 1; i <= n; i++) (C[i][0] = i), (P[i][0] = 2);
  for (let j = 1; j <= m; j++) (C[0][j] = j), (P[0][j] = 3);
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const diag = C[i - 1][j - 1] + dist(G[i - 1].k, W[j - 1].k) * 1.5;
      const arriba = C[i - 1][j] + 1;
      const izq = C[i][j - 1] + 1;
      if (diag <= arriba && diag <= izq) (C[i][j] = diag), (P[i][j] = 1);
      else if (arriba <= izq) (C[i][j] = arriba), (P[i][j] = 2);
      else (C[i][j] = izq), (P[i][j] = 3);
    }
  const tiempo = new Array(guion.length).fill(null);
  let aciertos = 0;
  for (let i = n, j = m; i > 0 || j > 0; ) {
    const p = P[i][j];
    if (p === 1) {
      const g = G[i - 1];
      if (dist(g.k, W[j - 1].k) < 0.5) {
        tiempo[g.gi] = tiempo[g.gi] === null ? W[j - 1].ms : Math.min(tiempo[g.gi], W[j - 1].ms);
        aciertos++;
      }
      i--, j--;
    } else if (p === 2) i--;
    else j--;
  }
  // Palabras del guion que no se oyeron bien: interpolar entre vecinas
  for (let i = 0; i < tiempo.length; i++) {
    if (tiempo[i] !== null) continue;
    let a = i - 1;
    while (a >= 0 && tiempo[a] === null) a--;
    let b = i + 1;
    while (b < tiempo.length && tiempo[b] === null) b++;
    const ta = a >= 0 ? tiempo[a] : 0;
    const tb = b < tiempo.length ? tiempo[b] : ta + 400 * (b - a);
    // Si la anterior cierra frase, hubo pausa: la palabra perdida va pegada a la siguiente, no en mitad de la pausa
    const trasPausa = a >= 0 && /[.,:;?!…]$/.test(guion[a].texto) && b < tiempo.length;
    tiempo[i] = trasPausa
      ? Math.round(tb - Math.min(300, (tb - ta) / 2) * ((b - i) / (b - a)))
      : Math.round(ta + ((tb - ta) * (i - a)) / (b - a));
  }
  const finVoz = whisper.length ? whisper[whisper.length - 1].endMs : 0;
  const palabras = guion.map((g, i) => ({
    text: (i ? " " : "") + g.texto,
    startMs: tiempo[i],
    endMs: i + 1 < guion.length ? Math.max(tiempo[i], tiempo[i + 1]) : Math.max(tiempo[i] + 300, finVoz),
    timestampMs: tiempo[i],
    confidence: null,
    linea: g.linea,
  }));
  return { palabras, cobertura: aciertos / Math.max(1, G.length) };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , whisperPath, narracionPath, salida] = process.argv;
  if (!whisperPath || !narracionPath || !salida) {
    console.error("uso: palabras-whisper.json narracion.json salida.json");
    process.exit(1);
  }
  const { palabras, cobertura } = alinear(JSON.parse(readFileSync(whisperPath, "utf8")), JSON.parse(readFileSync(narracionPath, "utf8")));
  writeFileSync(salida, JSON.stringify(palabras, null, 1));
  console.log(`${palabras.length} palabras del guion alineadas · ${(cobertura * 100).toFixed(0)} % reconocidas en la voz -> ${salida}`);
  if (cobertura < 0.8) console.warn("Aviso: menos del 80 % coincide. ¿La voz lee el mismo texto que narracion.json?");
}
