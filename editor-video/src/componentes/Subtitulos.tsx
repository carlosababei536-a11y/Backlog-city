import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Bloque } from "../estilo/bloques";
import { COLOR, FUENTE, SUB } from "../estilo/tokens";

// Estilo de letra común a subtítulos y textos con contorno (estilo.md §3)
export const estiloTextoContorno = (tamano: number, color: string): React.CSSProperties => ({
  fontFamily: FUENTE,
  fontWeight: SUB.peso,
  fontSize: tamano,
  lineHeight: 1,
  textTransform: "uppercase",
  color,
  WebkitTextStroke: `${(SUB.contorno * 2 * tamano) / SUB.tamano}px ${COLOR.tinta}`,
  paintOrder: "stroke",
  textShadow: `0px ${(SUB.sombraY * tamano) / SUB.tamano}px 0px ${COLOR.tinta}`,
  whiteSpace: "nowrap",
});

export const Subtitulos: React.FC<{ bloques: Bloque[]; ocultarDesdeMs?: number }> = ({ bloques, ocultarDesdeMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Todo en fotogramas redondeados, igual que los cortes de plano, para que palabra y corte caigan juntos
  const aF = (ms: number) => Math.round((ms / 1000) * fps);
  if (ocultarDesdeMs !== undefined && frame >= aF(ocultarDesdeMs)) return null;

  const bloque = bloques.find((b) => frame >= aF(b.startMs) && frame < aF(b.endMs));
  if (!bloque) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SUB.centroY,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: `${SUB.separacionEm}em`,
          fontSize: SUB.tamano,
          height: SUB.tamano * 1.4,
        }}
      >
        {bloque.palabras
          .filter((p) => aF(p.startMs) <= frame)
          .map((p, i) => {
            const desde = aF(p.startMs);
            // Escala 0,7 → 1 en 5 fotogramas, sin rebote. Se anima el tamaño (no un transform)
            // para que la línea se recentre a la vez, como en la referencia.
            const escala = interpolate(frame - desde, [0, SUB.popFotogramas], [SUB.popEscalaInicial, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span key={i} style={estiloTextoContorno(SUB.tamano * escala, p.destacada ? COLOR.rojo : COLOR.blanco)}>
                {p.texto}
              </span>
            );
          })}
      </div>
    </AbsoluteFill>
  );
};
