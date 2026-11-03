// Convierte el plan (anclado a palabras) en fotogramas: planos, escenas, rótulos y efectos.
import type { Caption } from "@remotion/captions";
import { normalizar } from "../estilo/bloques";
import { CAMARA } from "../estilo/tokens";
import type { Encuadre, EscenaDef, PlanoDef, RotuloDef, SfxDef } from "./plan";

export type PalabraVoz = Caption & { linea?: string };

export type PlanoResuelto = PlanoDef & {
  escena: number;
  desde: number; // fotograma absoluto
  hasta: number;
  fin: Encuadre;
  transSalida?: "desenfoque";
};

export type EscenaResuelta = EscenaDef & {
  indice: number;
  desde: number;
  hasta: number;
  marcasF: Record<string, number>; // relativas al inicio de la escena
};

export type RotuloResuelto = RotuloDef & { escena: number; desde: number; hastaF: number };
export type SfxResuelto = SfxDef & { desde: number };

export const crearResolver = (palabras: PalabraVoz[], fps: number) => {
  const porLinea: Record<string, PalabraVoz[]> = {};
  for (const p of palabras) (porLinea[p.linea ?? ""] ??= []).push(p);
  return (linea: string, ancla: string): number => {
    const lista = porLinea[linea];
    if (!lista?.length) throw new Error(`Línea sin palabras: ${linea}`);
    let p: PalabraVoz | undefined;
    if (ancla === "^") p = lista[0];
    else {
      const [clave, n] = ancla.split("#");
      p = lista.filter((x) => normalizar(x.text) === normalizar(clave))[Number(n ?? 1) - 1];
    }
    if (!p) throw new Error(`No encuentro la palabra «${ancla}» en ${linea}`);
    return Math.round((p.startMs / 1000) * fps);
  };
};

export const resolverMontaje = (
  plan: EscenaDef[],
  palabras: PalabraVoz[],
  fps: number,
  duracionTotal: number,
) => {
  const en = crearResolver(palabras, fps);
  const inicioPalabras = palabras.map((p) => Math.round((p.startMs / 1000) * fps));

  // 1) Planos con su inicio
  let planos: PlanoResuelto[] = [];
  plan.forEach((esc, i) =>
    esc.planos.forEach((pl) =>
      planos.push({ ...pl, escena: i, desde: en(esc.linea, pl.en), hasta: 0, fin: pl.fin ?? { ...pl.enc, s: pl.enc.s * (1 + CAMARA.acercamientoPorPlano) } }),
    ),
  );
  planos.sort((a, b) => a.desde - b.desde);
  planos[0].desde = 0;
  planos.forEach((p, i) => (p.hasta = i + 1 < planos.length ? planos[i + 1].desde : duracionTotal));

  // 2) Regla de estilo: ningún plano más de 1,6 s → punch-in (x1,4) en la palabra más cercana a la mitad
  const max = Math.round(CAMARA.planoMaxSegundos * fps);
  const minParte = Math.round(0.5 * fps);
  let cambiado = true;
  while (cambiado) {
    cambiado = false;
    const nuevos: PlanoResuelto[] = [];
    for (const p of planos) {
      const dur = p.hasta - p.desde;
      if (dur > max && !p.sinPunch) {
        const mitad = p.desde + dur / 2;
        const candidatas = inicioPalabras.filter((f) => f - p.desde >= minParte && p.hasta - f >= minParte);
        if (candidatas.length) {
          const corte = candidatas.reduce((a, b) => (Math.abs(b - mitad) < Math.abs(a - mitad) ? b : a));
          const t = (corte - p.desde) / dur;
          const lerp = (a: number, b: number) => a + (b - a) * t;
          const medio: Encuadre = { s: lerp(p.enc.s, p.fin.s), x: lerp(p.enc.x, p.fin.x), y: lerp(p.enc.y, p.fin.y), r: lerp(p.enc.r ?? 0, p.fin.r ?? 0) };
          const punch = p.punch ?? { ...medio, s: medio.s * CAMARA.punchIn };
          nuevos.push({ ...p, hasta: corte, fin: medio });
          nuevos.push({
            ...p,
            trans: undefined,
            desde: corte,
            enc: punch,
            fin: { ...punch, s: punch.s * (1 + CAMARA.acercamientoPorPlano * 0.8) },
            punch: { ...punch, s: punch.s * 0.72 }, // si hay que volver a partir, se abre el plano
          });
          cambiado = true;
          continue;
        }
      }
      nuevos.push(p);
    }
    planos = nuevos;
  }
  planos.forEach((p, i) => {
    if (i + 1 < planos.length && planos[i + 1].trans === "desenfoque") p.transSalida = "desenfoque";
  });

  // 3) Escenas: desde su primer plano hasta el primer plano de la escena siguiente
  const escenas: EscenaResuelta[] = plan.map((esc, i) => {
    const ps = planos.filter((p) => p.escena === i);
    const desde = Math.min(...ps.map((p) => p.desde));
    const hasta = Math.max(...ps.map((p) => p.hasta));
    const marcasF: Record<string, number> = {};
    for (const [k, ancla] of Object.entries(esc.marcas ?? {})) marcasF[k] = en(esc.linea, ancla) - desde;
    return { ...esc, indice: i, desde, hasta, marcasF };
  });

  // 4) Rótulos y efectos de sonido
  const rotulos: RotuloResuelto[] = [];
  const sfx: SfxResuelto[] = [];
  escenas.forEach((esc) => {
    for (const r of esc.rotulos ?? []) {
      const desde = en(esc.linea, r.en);
      const hasta = "hasta" in r && r.hasta ? en(esc.linea, r.hasta) : esc.hasta;
      rotulos.push({ ...r, escena: esc.indice, desde, hastaF: hasta });
    }
    for (const s of esc.sfx ?? []) sfx.push({ ...s, desde: Math.max(0, en(esc.linea, s.en) + Math.round(((s.desfaseMs ?? 0) / 1000) * fps)) });
  });

  return { planos, escenas, rotulos, sfx, resolver: en };
};
