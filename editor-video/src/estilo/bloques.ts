import type { Caption } from "@remotion/captions";
import { SUB } from "./tokens";

// Palabra ya preparada para pantalla
export type Palabra = {
  texto: string; // en MAYÚSCULAS, sin comillas
  clave: string; // normalizada para buscar (minúsculas, sin tildes ni signos)
  startMs: number;
  endMs: number;
  linea?: string;
  destacada: boolean;
};

export type Bloque = {
  palabras: Palabra[];
  startMs: number;
  endMs: number; // hasta que entra el siguiente bloque (corte seco)
};

export const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

const limpiar = (s: string) => s.trim().replace(/["'«»“”]/g, "").toUpperCase();

const terminaFrase = (t: string) => /[.,;:!?…]$/.test(t) || t.endsWith("...");
const esNumero = (t: string) => /^\d+[.,]?$/.test(t);

/**
 * Agrupa palabras en bloques según estilo.md §3:
 *  1) se cierra tras coma, punto, puntos suspensivos o dos puntos;
 *  2) si no, a las 3 palabras o al pasar de 18 caracteres;
 *  3) un número nunca se separa de la palabra que le sigue;
 *  4) una pausa en la voz (> pausaMs entre palabras) también cierra el bloque.
 * `destacadas`: por línea, las claves (normalizadas) de las palabras en rojo. Máx. 1 por bloque.
 */
export const crearBloques = (
  captions: (Caption & { linea?: string })[],
  destacadas: Record<string, string[]> = {},
  { pausaMs = 350, colaMs = 900 }: { pausaMs?: number; colaMs?: number } = {},
): Bloque[] => {
  const palabras: Palabra[] = captions
    .map((c) => ({
      texto: limpiar(c.text),
      clave: normalizar(c.text),
      startMs: c.startMs,
      endMs: c.endMs,
      linea: c.linea,
      destacada: false,
    }))
    .filter((p) => p.texto.length > 0);

  const largo = (ps: Palabra[]) => ps.map((p) => p.texto).join(" ").length;

  const bloques: Palabra[][] = [];
  let actual: Palabra[] = [];
  const cerrar = () => {
    if (actual.length) bloques.push(actual);
    actual = [];
  };

  for (let i = 0; i < palabras.length; i++) {
    const p = palabras[i];
    // ¿Cabe esta palabra (y, si es un número, también la siguiente) en el bloque actual?
    const grupo = esNumero(p.texto) && i + 1 < palabras.length && !terminaFrase(p.texto) ? [p, palabras[i + 1]] : [p];
    const cabe =
      actual.length + grupo.length <= SUB.maxPalabras && largo([...actual, ...grupo]) <= SUB.maxCaracteres;
    const cambioLinea = actual.length > 0 && actual[actual.length - 1].linea !== p.linea;
    const pausa = actual.length > 0 && p.startMs - actual[actual.length - 1].endMs > pausaMs;
    if (!cabe || cambioLinea || pausa) cerrar();
    actual.push(p);
    if (terminaFrase(p.texto)) cerrar();
  }
  cerrar();

  // Palabras destacadas: la primera que coincida en cada bloque
  for (const b of bloques) {
    const lista = destacadas[b[0].linea ?? ""] ?? [];
    const elegida = b.find((p) => lista.includes(p.clave));
    if (elegida) elegida.destacada = true;
  }

  return bloques.map((ps, i) => ({
    palabras: ps,
    startMs: ps[0].startMs,
    endMs: i + 1 < bloques.length ? bloques[i + 1][0].startMs : ps[ps.length - 1].endMs + colaMs,
  }));
};
