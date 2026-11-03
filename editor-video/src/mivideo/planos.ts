// Cortes automáticos para un vídeo grabado (estilo.md §2 y §7):
// un plano nuevo cada 0,9–1,6 s, siempre al empezar un bloque de subtítulo (o, si no hay, una palabra),
// alternando plano normal y punch-in (x1,35 por defecto) y con acercamiento lento de +4 % en cada plano.
import type { PlanoCamara } from "../componentes/Camara";
import type { Bloque } from "../estilo/bloques";
import { CAMARA } from "../estilo/tokens";

export type OpcionesPlanos = {
  foco: { x: number; y: number }; // dónde está la cara en el vídeo (px en 1080 x 1920)
  punch: number; // escala del punch-in
  minS: number;
  maxS: number;
};

export const OPCIONES_POR_DEFECTO: OpcionesPlanos = { foco: { x: 540, y: 760 }, punch: 1.35, minS: 0.9, maxS: CAMARA.planoMaxSegundos };

export const crearPlanos = (bloques: Bloque[], duracion: number, fps: number, o: OpcionesPlanos = OPCIONES_POR_DEFECTO): PlanoCamara[] => {
  const aF = (ms: number) => Math.round((ms / 1000) * fps);
  const iniciosBloque = bloques.map((b) => aF(b.startMs));
  const iniciosPalabra = bloques.flatMap((b) => b.palabras.map((p) => aF(p.startMs)));
  const min = Math.round(o.minS * fps);
  const max = Math.round(o.maxS * fps);
  const ideal = Math.round(1.2 * fps);

  const cortes = [0];
  for (;;) {
    const ult = cortes[cortes.length - 1];
    if (duracion - ult <= max) break;
    const enRango = (f: number) => f - ult >= min && f - ult <= max && duracion - f >= min;
    const deBloque = iniciosBloque.filter(enRango);
    const dePalabra = iniciosPalabra.filter(enRango);
    const elegir = (fs: number[]) => fs.reduce((a, b) => (Math.abs(b - ult - ideal) < Math.abs(a - ult - ideal) ? b : a));
    const siguiente = deBloque.length ? deBloque[0] : dePalabra.length ? elegir(dePalabra) : ult + ideal;
    cortes.push(siguiente);
  }

  return cortes.map((desde, i) => {
    const hasta = i + 1 < cortes.length ? cortes[i + 1] : duracion;
    const s = i % 2 === 0 ? 1 : o.punch;
    const enc = { s, x: o.foco.x, y: o.foco.y };
    return { desde, hasta, enc, fin: { ...enc, s: s * (1 + CAMARA.acercamientoPorPlano) } };
  });
};
