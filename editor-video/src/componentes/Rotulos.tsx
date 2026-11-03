import React from "react";
import { Easing, interpolate } from "remotion";
import { COLOR, FUENTE, SUB } from "../estilo/tokens";
import { estiloTextoContorno } from "./Subtitulos";

// Salto de entrada común (estilo.md §3/§4): escala 0,7 → 1 en 5 fotogramas, sin rebote
export const pop = (f: number, desde: number, fotogramas: number = SUB.popFotogramas) =>
  interpolate(f - desde, [0, fotogramas], [SUB.popEscalaInicial, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const texto = (tamano: number, color: string, peso = 900): React.CSSProperties => ({
  fontFamily: FUENTE,
  fontWeight: peso,
  fontSize: tamano,
  lineHeight: 1,
  color,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

type Base = { f: number; desde: number; x: number; y: number };

const Caja: React.FC<React.PropsWithChildren<Base & { rot?: number; escala?: number }>> = ({
  f,
  desde,
  x,
  y,
  rot = 0,
  escala = 1,
  children,
}) => {
  if (f < desde) return null;
  const s = pop(f, desde) * escala;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
        transformOrigin: "center",
      }}
    >
      {children}
    </div>
  );
};

/** Etiqueta «NOMBRE · DATO» (crema, borde tinta 6 px, esquinas 18 px; dato en rojo) */
export const Etiqueta: React.FC<Base & { nombre: string; dato: string; tamano?: number }> = ({
  nombre,
  dato,
  tamano = 64,
  ...b
}) => (
  <Caja {...b}>
    <div
      style={{
        background: COLOR.crema,
        border: `6px solid ${COLOR.tinta}`,
        borderRadius: 18,
        padding: `${tamano * 0.42}px ${tamano * 0.8}px`,
        display: "flex",
        gap: tamano * 0.3,
        alignItems: "center",
      }}
    >
      <span style={texto(tamano, COLOR.tinta)}>{nombre}</span>
      <span style={texto(tamano, COLOR.tinta)}>·</span>
      <span style={texto(tamano, COLOR.rojo)}>{dato}</span>
    </div>
  </Caja>
);

/** Etiqueta roja con línea hacia un punto (píldora roja, texto blanco, línea blanca 3 px, punto rojo con aro blanco) */
export const Llamada: React.FC<Base & { texto: string; px: number; py: number; tamano?: number }> = ({
  f,
  desde,
  x,
  y,
  texto: t,
  px,
  py,
  tamano = 38,
}) => {
  if (f < desde) return null;
  const linea = interpolate(f - desde, [2, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lx = x + (px - x) * linea;
  const ly = y + (py - y) * linea;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <line x1={x} y1={y} x2={lx} y2={ly} stroke={COLOR.tinta} strokeWidth={7} strokeLinecap="round" />
        <line x1={x} y1={y} x2={lx} y2={ly} stroke={COLOR.blanco} strokeWidth={3} strokeLinecap="round" />
        {linea > 0.95 && (
          <>
            <circle cx={px} cy={py} r={13} fill={COLOR.blanco} stroke={COLOR.tinta} strokeWidth={3} />
            <circle cx={px} cy={py} r={7} fill={COLOR.rojo} />
          </>
        )}
      </svg>
      <Caja f={f} desde={desde} x={x} y={y}>
        <div
          style={{
            background: COLOR.rojo,
            border: `3px solid ${COLOR.tinta}`,
            borderRadius: 12,
            padding: `${tamano * 0.5}px ${tamano * 0.8}px`,
          }}
        >
          <span style={texto(tamano, COLOR.blanco, 800)}>{t}</span>
        </div>
      </Caja>
    </>
  );
};

/** Cartel de 2 líneas (crema, borde 6 px, girado −3°; 1.ª línea tinta, 2.ª roja) */
export const Cartel: React.FC<Base & { linea1: string; linea2: string; tamano?: number; rot?: number }> = ({
  linea1,
  linea2,
  tamano = 75,
  rot = -3,
  ...b
}) => (
  <Caja {...b} rot={rot}>
    <div
      style={{
        background: COLOR.crema,
        border: `6px solid ${COLOR.tinta}`,
        borderRadius: 10,
        padding: `${tamano * 0.6}px ${tamano * 0.9}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tamano * 0.18,
        boxShadow: `0 8px 0 rgba(0,0,0,0.25)`,
      }}
    >
      <span style={texto(tamano, COLOR.tinta)}>{linea1}</span>
      <span style={texto(tamano, COLOR.rojo)}>{linea2}</span>
    </div>
  </Caja>
);

/** Insignia «DÍA N» con contador (crema, 502 x 175 px, número rojo) */
export const InsigniaDia: React.FC<Base & { de: number; a: number; contarFotogramas?: number; prefijo?: string }> = ({
  de,
  a,
  contarFotogramas = 30,
  prefijo = "DÍA",
  ...b
}) => {
  const n = Math.round(
    interpolate(b.f - b.desde, [4, 4 + contarFotogramas], [de, a], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    }),
  );
  return (
    <Caja {...b}>
      <div
        style={{
          background: COLOR.crema,
          border: `6px solid ${COLOR.tinta}`,
          borderRadius: 16,
          width: 502,
          height: 175,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          boxShadow: `0 8px 0 rgba(0,0,0,0.25)`,
        }}
      >
        <span style={texto(92, COLOR.tinta)}>{prefijo}</span>
        <span style={{ ...texto(92, COLOR.rojo), minWidth: 120, textAlign: "left" }}>{n}</span>
      </div>
    </Caja>
  );
};

/** Calendario: cabecera roja con anillas, número gigante y mes. Entra girado 14° y crece +70 % en ~1 s */
export const Calendario: React.FC<Base & { cabecera: string; numero: string; mes?: string; ancho?: number }> = ({
  f,
  desde,
  x,
  y,
  cabecera,
  numero,
  mes,
  ancho = 560,
}) => {
  if (f < desde) return null;
  const p = interpolate(f - desde, [0, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const s = interpolate(p, [0, 1], [0.6, 1.02]);
  const rot = interpolate(p, [0, 1], [14, 3]);
  const alto = ancho * 1.08;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: ancho,
        height: alto,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COLOR.crema,
          border: `7px solid ${COLOR.tinta}`,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: `0 14px 0 rgba(0,0,0,0.3)`,
        }}
      >
        <div
          style={{
            height: alto * 0.24,
            background: COLOR.rojo,
            borderBottom: `7px solid ${COLOR.tinta}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ ...texto(ancho * 0.13, COLOR.blanco), WebkitTextStroke: `4px ${COLOR.tinta}`, paintOrder: "stroke" }}>
            {cabecera}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: alto * 0.07 }}>
          <span style={texto(ancho * (mes ? 0.42 : 0.5), COLOR.tinta)}>{numero}</span>
          {mes && <span style={{ ...texto(ancho * 0.12, COLOR.rojo), marginTop: alto * 0.04 }}>{mes}</span>}
        </div>
      </div>
      {/* anillas */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: -18,
            left: ancho * 0.14 + i * ancho * 0.144,
            width: 26,
            height: 26,
            borderRadius: 13,
            background: COLOR.blanco,
            border: `5px solid ${COLOR.tinta}`,
          }}
        />
      ))}
    </div>
  );
};

/** Cifra gigante roja arriba (cuerpo ≈ 175 px, y ≈ 334–457) */
export const CifraGigante: React.FC<{ f: number; desde: number; texto: string; y?: number; tamano?: number }> = ({
  f,
  desde,
  texto: t,
  y = 400,
  tamano = 175,
}) => {
  if (f < desde) return null;
  const s = pop(f, desde, 6);
  return (
    <div style={{ position: "absolute", left: 540, top: y, transform: `translate(-50%, -50%) scale(${s})` }}>
      <span style={{ ...texto(tamano, COLOR.rojo), WebkitTextStroke: `10px ${COLOR.tinta}`, paintOrder: "stroke" }}>{t}</span>
    </div>
  );
};

/** Cuadrícula de iconos de minero (casco); `encendidos` se anima de `de` a `a` */
export const CuadriculaMineros: React.FC<{
  f: number;
  desde: number;
  total: number;
  de: number;
  a: number;
  fotogramas?: number;
  columnas?: number;
  y?: number;
}> = ({ f, desde, total, de, a, fotogramas = 40, columnas = 6, y = 620 }) => {
  if (f < desde) return null;
  const encendidos = Math.round(
    interpolate(f - desde, [0, fotogramas], [de, a], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const tam = 118;
  const filas = Math.ceil(total / columnas);
  const ancho = columnas * tam;
  return (
    <svg
      style={{ position: "absolute", left: 540 - ancho / 2, top: y }}
      width={ancho}
      height={filas * tam * 1.05}
      viewBox={`0 0 ${ancho} ${filas * tam * 1.05}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const cx = (i % columnas) * tam + tam / 2;
        const cy = Math.floor(i / columnas) * tam * 1.05 + tam / 2;
        const on = i < encendidos;
        const col = on ? COLOR.casco : "#4A4F57";
        const cuerpo = on ? COLOR.mono : "#3A3F47";
        return (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <path d="M-34 44 Q-34 8 0 8 Q34 8 34 44 Z" fill={cuerpo} />
            <circle cx={0} cy={-12} r={18} fill={on ? COLOR.piel : "#5A6068"} />
            <path d="M-24 -18 Q-24 -42 0 -42 Q24 -42 24 -18 Z" fill={col} />
            <rect x={-29} y={-20} width={58} height={7} rx={3} fill={col} />
          </g>
        );
      })}
    </svg>
  );
};

/** Pregunta final arriba: 2 líneas centradas (blanca + roja), cuerpo ≈ 80 px, mismo contorno que los subtítulos */
export const Pregunta: React.FC<{ f: number; desde: number; linea1: string; linea2: string }> = ({ f, desde, linea1, linea2 }) => {
  if (f < desde) return null;
  const s = pop(f, desde);
  return (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 372,
        transform: `translate(-50%, -50%) scale(${s})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <span style={estiloTextoContorno(80, COLOR.blanco)}>{linea1}</span>
      <span style={estiloTextoContorno(80, COLOR.rojo)}>{linea2}</span>
    </div>
  );
};
