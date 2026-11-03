import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { TRANS } from "../estilo/tokens";

export type Encuadre = { s: number; x: number; y: number; r?: number };
export type PlanoCamara = {
  desde: number;
  hasta: number;
  enc: Encuadre;
  fin: Encuadre;
  temblor?: number;
  trans?: "desenfoque" | "flash";
  transSalida?: "desenfoque";
};

/** Transform de cámara para un fotograma relativo al plano: pone (x, y) del lienzo en el centro con escala y giro */
export const transformCamara = (plano: PlanoCamara, frame: number, ancho = 1080, alto = 1920) => {
  const dur = plano.hasta - plano.desde;
  const t = interpolate(frame, [0, Math.max(1, dur)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = plano.enc.s + (plano.fin.s - plano.enc.s) * t;
  const x = plano.enc.x + (plano.fin.x - plano.enc.x) * t;
  const y = plano.enc.y + (plano.fin.y - plano.enc.y) * t;
  const r = (plano.enc.r ?? 0) + ((plano.fin.r ?? 0) - (plano.enc.r ?? 0)) * t;
  const temblor = plano.temblor ? plano.temblor * Math.max(0, 1 - frame / 24) : 0;
  const dx = temblor * Math.sin(frame * 2.3);
  const dy = temblor * Math.cos(frame * 3.1);
  // Desenfoque de transición (5 fotogramas: 2 saliendo, 1 máximo, 2 entrando)
  let blur = 0;
  if (plano.trans === "desenfoque" && frame < 3) blur = [TRANS.desenfoque[2], TRANS.desenfoque[3], TRANS.desenfoque[4]][frame];
  if (plano.transSalida === "desenfoque" && dur - frame <= 2) blur = [TRANS.desenfoque[0], TRANS.desenfoque[1]][2 - (dur - frame)] ?? 0;
  return {
    blur,
    estilo: {
      transformOrigin: `${x}px ${y}px`,
      transform: `translate(${ancho / 2 - x + dx}px, ${alto / 2 - y + dy}px) scale(${s}) rotate(${r}deg)`,
    } as React.CSSProperties,
  };
};

/** Cámara: `frame` relativo al inicio del plano */
export const Camara: React.FC<React.PropsWithChildren<{ plano: PlanoCamara; frame: number }>> = ({ plano, frame, children }) => {
  const { blur, estilo } = transformCamara(plano, frame);
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: blur ? `blur(${blur}px)` : undefined }}>
      <AbsoluteFill style={estilo}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
