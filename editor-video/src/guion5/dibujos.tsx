// Piezas de ilustración vectorial plana (contorno tinta 6 px, colores planos), estilo.md §5
import React from "react";
import { interpolate, random } from "remotion";
import { COLOR } from "../estilo/tokens";

export const T = COLOR.tinta;
export const TRAZO = 6;

export type Expresion = "miedo" | "serio" | "cansado" | "alivio" | "sonrisa" | "grito" | "asombro";

type MineroProps = {
  x: number;
  y: number;
  escala?: number;
  expresion?: Expresion;
  lampara?: number; // 0..1
  polvo?: number; // 0..1
  gafas?: boolean;
  lagrima?: number; // 0..1 (recorrido de la lágrima)
  bigote?: boolean;
  barba?: boolean;
  casco?: string;
  piel?: string;
  pelo?: string;
  cuerpo?: "busto" | "entero" | "sentado" | "cabeza";
  mirada?: [number, number];
  sudor?: boolean;
  parpadeo?: boolean;
  brazosArriba?: number; // 0..1
  flip?: boolean;
  delgado?: number; // 0..1 (más delgado tras días sin comer)
};

const Cejas: React.FC<{ e: Expresion; pelo: string }> = ({ e, pelo }) => {
  const sw = 13;
  const p: Record<Expresion, [string, string]> = {
    miedo: ["M-82 -42 Q-55 -62 -22 -52", "M82 -42 Q55 -62 22 -52"],
    asombro: ["M-82 -52 Q-55 -72 -22 -60", "M82 -52 Q55 -72 22 -60"],
    grito: ["M-82 -36 Q-55 -60 -22 -56", "M82 -36 Q55 -60 22 -56"],
    serio: ["M-82 -46 L-24 -36", "M82 -46 L24 -36"],
    cansado: ["M-82 -34 Q-55 -50 -24 -44", "M82 -34 Q55 -50 24 -44"],
    alivio: ["M-82 -44 Q-55 -56 -24 -48", "M82 -44 Q55 -56 24 -48"],
    sonrisa: ["M-82 -46 Q-55 -60 -24 -50", "M82 -46 Q55 -60 24 -50"],
  };
  return (
    <g stroke={pelo} strokeWidth={sw} strokeLinecap="round" fill="none">
      <path d={p[e][0]} />
      <path d={p[e][1]} />
    </g>
  );
};

const Boca: React.FC<{ e: Expresion }> = ({ e }) => {
  switch (e) {
    case "miedo":
      return <ellipse cx={0} cy={88} rx={20} ry={26} fill="#5A2320" stroke={T} strokeWidth={5} />;
    case "grito":
      return <ellipse cx={0} cy={92} rx={30} ry={36} fill="#5A2320" stroke={T} strokeWidth={5} />;
    case "asombro":
      return <ellipse cx={0} cy={90} rx={16} ry={20} fill="#5A2320" stroke={T} strokeWidth={5} />;
    case "serio":
      return <path d="M-30 90 L30 90" stroke={T} strokeWidth={6} strokeLinecap="round" />;
    case "cansado":
      return <path d="M-30 96 Q0 82 30 96" stroke={T} strokeWidth={6} fill="none" strokeLinecap="round" />;
    case "alivio":
      return <path d="M-34 84 Q0 104 34 84" stroke={T} strokeWidth={6} fill="none" strokeLinecap="round" />;
    case "sonrisa":
      return <path d="M-40 80 Q0 120 40 80 Z" fill="#5A2320" stroke={T} strokeWidth={5} strokeLinejoin="round" />;
  }
};

/** Minero: cabeza centrada en (x, y). Unidades: la cabeza mide ~250 x 290 a escala 1. */
export const Minero: React.FC<MineroProps> = ({
  x,
  y,
  escala = 1,
  expresion = "serio",
  lampara = 0,
  polvo = 0.5,
  gafas = false,
  lagrima,
  bigote = false,
  barba = false,
  casco = COLOR.casco,
  piel = COLOR.piel,
  pelo = "#4A3324",
  cuerpo = "busto",
  mirada = [0, 0],
  sudor = false,
  parpadeo = false,
  brazosArriba = 0,
  flip = false,
  delgado = 0,
}) => {
  const ojoRy = expresion === "miedo" || expresion === "asombro" || expresion === "grito" ? 30 : expresion === "cansado" ? 18 : 25;
  const anchoTorso = 210 - delgado * 30;
  const brazoAng = -brazosArriba * 150;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -escala : escala},${escala})`} strokeLinejoin="round">
      {/* cuerpo */}
      {cuerpo !== "cabeza" && (
        <g>
          {(cuerpo === "entero" || cuerpo === "sentado") && (
            <g>
              {cuerpo === "entero" ? (
                <>
                  <rect x={-anchoTorso + 40} y={500} width={120} height={360} rx={30} fill={COLOR.mono2} stroke={T} strokeWidth={TRAZO} />
                  <rect x={anchoTorso - 160} y={500} width={120} height={360} rx={30} fill={COLOR.mono2} stroke={T} strokeWidth={TRAZO} />
                  <rect x={-anchoTorso + 25} y={830} width={150} height={70} rx={24} fill="#3B2A1E" stroke={T} strokeWidth={TRAZO} />
                  <rect x={anchoTorso - 175} y={830} width={150} height={70} rx={24} fill="#3B2A1E" stroke={T} strokeWidth={TRAZO} />
                  <rect x={-anchoTorso + 40} y={700} width={120} height={22} fill={COLOR.reflectante} stroke={T} strokeWidth={4} />
                  <rect x={anchoTorso - 160} y={700} width={120} height={22} fill={COLOR.reflectante} stroke={T} strokeWidth={4} />
                </>
              ) : (
                <>
                  <rect x={-anchoTorso + 20} y={470} width={330} height={120} rx={40} fill={COLOR.mono2} stroke={T} strokeWidth={TRAZO} />
                  <rect x={60} y={500} width={110} height={300} rx={30} fill={COLOR.mono2} stroke={T} strokeWidth={TRAZO} />
                  <rect x={-140} y={500} width={110} height={300} rx={30} fill={COLOR.mono2} stroke={T} strokeWidth={TRAZO} />
                  <rect x={-155} y={770} width={150} height={66} rx={24} fill="#3B2A1E" stroke={T} strokeWidth={TRAZO} />
                  <rect x={45} y={770} width={150} height={66} rx={24} fill="#3B2A1E" stroke={T} strokeWidth={TRAZO} />
                </>
              )}
            </g>
          )}
          {/* brazos */}
          <g transform={`rotate(${brazoAng}, ${-anchoTorso + 20}, 230)`}>
            <rect x={-anchoTorso - 30} y={220} width={90} height={300} rx={40} fill={COLOR.mono} stroke={T} strokeWidth={TRAZO} />
            <circle cx={-anchoTorso + 15} cy={530} r={38} fill={piel} stroke={T} strokeWidth={TRAZO} />
          </g>
          <g transform={`rotate(${-brazoAng}, ${anchoTorso - 20}, 230)`}>
            <rect x={anchoTorso - 60} y={220} width={90} height={300} rx={40} fill={COLOR.mono} stroke={T} strokeWidth={TRAZO} />
            <circle cx={anchoTorso - 15} cy={530} r={38} fill={piel} stroke={T} strokeWidth={TRAZO} />
          </g>
          {/* torso */}
          <path
            d={`M${-anchoTorso} 560 L${-anchoTorso} 270 Q${-anchoTorso} 190 ${-anchoTorso + 80} 185 L${anchoTorso - 80} 185 Q${anchoTorso} 190 ${anchoTorso} 270 L${anchoTorso} 560 Z`}
            fill={COLOR.mono}
            stroke={T}
            strokeWidth={TRAZO}
          />
          <path d="M-60 185 L0 250 L60 185 Z" fill="#6E7B85" stroke={T} strokeWidth={5} />
          <rect x={-anchoTorso + 3} y={330} width={anchoTorso * 2 - 6} height={28} fill={COLOR.reflectante} stroke={T} strokeWidth={4} />
          <path d={`M${-anchoTorso + 70} 188 L${-anchoTorso + 70} 560 M${anchoTorso - 70} 188 L${anchoTorso - 70} 560`} stroke={COLOR.mono2} strokeWidth={10} />
          {polvo > 0 && (
            <g fill="#5B4330" opacity={0.3 * polvo}>
              <ellipse cx={-90} cy={430} rx={50} ry={30} />
              <ellipse cx={110} cy={480} rx={40} ry={24} />
              <ellipse cx={30} cy={300} rx={30} ry={18} />
            </g>
          )}
          {/* cuello */}
          <rect x={-42} y={120} width={84} height={80} fill={COLOR.piel2} stroke={T} strokeWidth={TRAZO} />
        </g>
      )}
      {/* orejas */}
      <circle cx={-126} cy={14} r={28} fill={piel} stroke={T} strokeWidth={TRAZO} />
      <circle cx={126} cy={14} r={28} fill={piel} stroke={T} strokeWidth={TRAZO} />
      {/* cabeza */}
      <ellipse cx={0} cy={10} rx={126} ry={146} fill={piel} stroke={T} strokeWidth={TRAZO} />
      {barba && <path d="M-118 40 Q-110 160 0 160 Q110 160 118 40 Q90 120 0 124 Q-90 120 -118 40 Z" fill={pelo} opacity={0.35} />}
      {/* polvo en la cara */}
      {polvo > 0 && (
        <g fill="#5B4330" opacity={0.28 * polvo}>
          <ellipse cx={-70} cy={60} rx={34} ry={20} />
          <ellipse cx={80} cy={-10} rx={26} ry={14} />
          <ellipse cx={30} cy={120} rx={30} ry={14} />
          <ellipse cx={-30} cy={-70} rx={22} ry={10} />
        </g>
      )}
      {/* mejillas */}
      <ellipse cx={-72} cy={52} rx={24} ry={14} fill="#E07A6A" opacity={0.35} />
      <ellipse cx={72} cy={52} rx={24} ry={14} fill="#E07A6A" opacity={0.35} />
      {/* ojos */}
      {gafas ? (
        <g>
          <rect x={-112} y={-30} width={100} height={62} rx={22} fill="#1D1F22" stroke={T} strokeWidth={TRAZO} />
          <rect x={12} y={-30} width={100} height={62} rx={22} fill="#1D1F22" stroke={T} strokeWidth={TRAZO} />
          <path d="M-12 -6 Q0 -14 12 -6" stroke={T} strokeWidth={TRAZO} fill="none" />
          <path d="M-96 -18 L-70 -18 L-92 14 Z M28 -18 L54 -18 L32 14 Z" fill="#FFFFFF" opacity={0.25} />
        </g>
      ) : parpadeo ? (
        <g stroke={T} strokeWidth={7} strokeLinecap="round">
          <path d="M-78 5 Q-50 18 -22 5" fill="none" />
          <path d="M78 5 Q50 18 22 5" fill="none" />
        </g>
      ) : (
        <g>
          <ellipse cx={-50} cy={5} rx={30} ry={ojoRy} fill="#FFFFFF" stroke={T} strokeWidth={5} />
          <ellipse cx={50} cy={5} rx={30} ry={ojoRy} fill="#FFFFFF" stroke={T} strokeWidth={5} />
          <circle cx={-50 + mirada[0]} cy={8 + mirada[1]} r={15} fill="#3B2A1E" />
          <circle cx={50 + mirada[0]} cy={8 + mirada[1]} r={15} fill="#3B2A1E" />
          <circle cx={-45 + mirada[0]} cy={2 + mirada[1]} r={5} fill="#FFFFFF" />
          <circle cx={55 + mirada[0]} cy={2 + mirada[1]} r={5} fill="#FFFFFF" />
          {expresion === "cansado" && (
            <path d="M-82 -6 L-18 -6 M18 -6 L82 -6" stroke={T} strokeWidth={6} strokeLinecap="round" />
          )}
        </g>
      )}
      {!gafas && <Cejas e={expresion} pelo={pelo} />}
      {/* nariz */}
      <path d="M-4 20 Q-16 52 0 58 Q10 60 14 54" stroke={T} strokeWidth={5} fill="none" strokeLinecap="round" />
      {bigote && <path d="M-46 72 Q-20 56 0 66 Q20 56 46 72 Q24 80 0 74 Q-24 80 -46 72 Z" fill={pelo} stroke={T} strokeWidth={4} />}
      <Boca e={expresion} />
      {sudor && (
        <g fill="#CFE6F2" stroke={T} strokeWidth={4}>
          <path d="M92 -70 Q100 -52 92 -44 Q84 -52 92 -70 Z" />
          <path d="M-100 -40 Q-92 -22 -100 -14 Q-108 -22 -100 -40 Z" />
        </g>
      )}
      {lagrima !== undefined && lagrima > 0 && (
        <path
          transform={`translate(${gafas ? -40 : -55}, ${interpolate(lagrima, [0, 1], [gafas ? 36 : 34, 120])})`}
          d="M0 -18 Q10 0 0 10 Q-10 0 0 -18 Z"
          fill="#CFE6F2"
          stroke={T}
          strokeWidth={4}
          opacity={interpolate(lagrima, [0, 0.08, 0.9, 1], [0, 1, 1, 0])}
        />
      )}
      {/* casco */}
      <path d="M-150 -46 Q-150 -222 0 -222 Q150 -222 150 -46 Z" fill={casco} stroke={T} strokeWidth={TRAZO} />
      <path d="M-24 -218 L-24 -60 M24 -218 L24 -60" stroke={COLOR.casco2} strokeWidth={10} opacity={0.7} />
      <rect x={-176} y={-66} width={352} height={36} rx={18} fill={casco} stroke={T} strokeWidth={TRAZO} />
      <rect x={-34} y={-168} width={68} height={56} rx={14} fill="#555A5E" stroke={T} strokeWidth={5} />
      <circle cx={0} cy={-140} r={21} fill={lampara > 0 ? COLOR.luz : "#9A9A8E"} stroke={T} strokeWidth={4} />
      {lampara > 0 && <circle cx={0} cy={-140} r={40} fill={COLOR.luz} opacity={0.35 * lampara} />}
    </g>
  );
};

/** Haz de luz de la linterna: triángulo con degradado que sale de (x, y) con un ángulo (grados) */
export const Haz: React.FC<{ id: string; x: number; y: number; ang: number; largo?: number; abertura?: number; intensidad?: number }> = ({
  id,
  x,
  y,
  ang,
  largo = 1400,
  abertura = 26,
  intensidad = 1,
}) => {
  const a1 = ((ang - abertura) * Math.PI) / 180;
  const a2 = ((ang + abertura) * Math.PI) / 180;
  return (
    <g opacity={intensidad}>
      <defs>
        <radialGradient id={id} cx={x} cy={y} r={largo} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={COLOR.luz} stopOpacity={0.75} />
          <stop offset="0.55" stopColor={COLOR.luz} stopOpacity={0.22} />
          <stop offset="1" stopColor={COLOR.luz} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={`M${x} ${y} L${x + Math.cos(a1) * largo} ${y + Math.sin(a1) * largo} L${x + Math.cos(a2) * largo} ${y + Math.sin(a2) * largo} Z`}
        fill={`url(#${id})`}
      />
    </g>
  );
};

/** Partículas de polvo en suspensión, deterministas */
export const Polvo: React.FC<{ f: number; n?: number; x0?: number; y0?: number; w?: number; h?: number; color?: string; semilla?: string; velocidad?: number; tam?: number }> = ({
  f,
  n = 60,
  x0 = 0,
  y0 = 0,
  w = 1080,
  h = 1920,
  color = COLOR.polvo,
  semilla = "polvo",
  velocidad = 1,
  tam = 1,
}) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const r = (k: string) => random(`${semilla}-${i}-${k}`);
      const px = x0 + ((r("x") * w + f * (r("vx") - 0.5) * 2 * velocidad + w) % w);
      const py = y0 + ((r("y") * h - f * (0.4 + r("vy")) * velocidad + h * 10) % h);
      return <circle key={i} cx={px} cy={py} r={(2 + r("r") * 5) * tam} fill={color} opacity={0.25 + r("o") * 0.45} />;
    })}
  </g>
);

/** Roca poligonal con contorno */
export const Roca: React.FC<{ x: number; y: number; r: number; color?: string; semilla: string; rot?: number }> = ({
  x,
  y,
  r,
  color = COLOR.roca3,
  semilla,
  rot = 0,
}) => {
  const n = 7;
  const pts = Array.from({ length: n })
    .map((_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.75 + random(`${semilla}-${i}`) * 0.4);
      return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
    })
    .join(" ");
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <polygon points={pts} fill={color} stroke={T} strokeWidth={TRAZO} strokeLinejoin="round" />
      <polygon points={pts} fill="#000" opacity={0.12} transform={`translate(${r * 0.15},${r * 0.2}) scale(0.7)`} />
    </g>
  );
};

/** Fondo de pared de roca de la mina (manchas de roca planas) */
export const ParedRoca: React.FC<{ semilla?: string; base?: string; tono?: string; oscuro?: number }> = ({
  semilla = "pared",
  base = COLOR.roca1,
  tono = COLOR.roca2,
  oscuro = 0,
}) => (
  <g>
    <rect x={-1500} y={-1500} width={4080} height={4920} fill={base} />
    {Array.from({ length: 26 }).map((_, i) => {
      const r = (k: string) => random(`${semilla}-${i}-${k}`);
      return (
        <ellipse
          key={i}
          cx={-200 + r("x") * 1480}
          cy={-200 + r("y") * 2320}
          rx={90 + r("w") * 220}
          ry={60 + r("h") * 140}
          fill={tono}
          opacity={0.55 + r("o") * 0.4}
          transform={`rotate(${r("a") * 60 - 30})`}
        />
      );
    })}
    {oscuro > 0 && <rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={oscuro} />}
  </g>
);

/** Bandera de Chile ondeando */
export const BanderaChile: React.FC<{ x: number; y: number; escala?: number; f: number; fase?: number }> = ({ x, y, escala = 1, f, fase = 0 }) => {
  const o = Math.sin((f + fase) / 6) * 10;
  const ondula = (yy: number) => `Q60 ${yy + o} 120 ${yy} T240 ${yy}`;
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`}>
      <rect x={-10} y={0} width={12} height={420} fill="#6B5440" stroke={T} strokeWidth={4} />
      <g transform="translate(2, 10)">
        <path d={`M0 80 ${ondula(80)} L240 160 Q180 ${160 - o} 120 160 T0 160 Z`} fill={COLOR.rojoChile} stroke={T} strokeWidth={5} />
        <path d={`M0 0 ${ondula(0)} L240 80 Q180 ${80 - o} 120 80 T0 80 Z`} fill="#FFFFFF" stroke={T} strokeWidth={5} />
        <rect x={0} y={0} width={80} height={80} fill={COLOR.azulChile} stroke={T} strokeWidth={5} />
        <path d="M40 18 L46 34 L63 34 L49 44 L54 61 L40 51 L26 61 L31 44 L17 34 L34 34 Z" fill="#FFFFFF" />
      </g>
    </g>
  );
};

/** Tienda de campaña */
export const Tienda: React.FC<{ x: number; y: number; escala?: number; color?: string }> = ({ x, y, escala = 1, color = "#3F6E8C" }) => (
  <g transform={`translate(${x},${y}) scale(${escala})`}>
    <path d="M-170 0 L0 -190 L170 0 Z" fill={color} stroke={T} strokeWidth={TRAZO} strokeLinejoin="round" />
    <path d="M0 -190 L-50 0 L50 0 Z" fill="#000" opacity={0.25} />
    <path d="M0 -190 L-50 0 M0 -190 L50 0" stroke={T} strokeWidth={4} />
  </g>
);

/** Vela encendida */
export const Vela: React.FC<{ x: number; y: number; f: number; escala?: number; fase?: number }> = ({ x, y, f, escala = 1, fase = 0 }) => {
  const parpadeo = 1 + Math.sin((f + fase) / 3) * 0.08;
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`}>
      <circle cx={0} cy={-62} r={46 * parpadeo} fill={COLOR.luz} opacity={0.3} />
      <rect x={-14} y={-40} width={28} height={60} rx={4} fill="#F6EEDC" stroke={T} strokeWidth={4} />
      <path d={`M0 ${-74 * parpadeo} Q12 -52 0 -42 Q-12 -52 0 ${-74 * parpadeo} Z`} fill="#FFC23D" stroke={T} strokeWidth={3} />
    </g>
  );
};

/** Persona sencilla (familiares), sin casco */
export const Persona: React.FC<{ x: number; y: number; escala?: number; ropa?: string; pelo?: string; piel?: string; brazosArriba?: number; expresion?: "sonrisa" | "serio" | "grito" }> = ({
  x,
  y,
  escala = 1,
  ropa = "#7A4E8C",
  pelo = "#2E2018",
  piel = COLOR.piel,
  brazosArriba = 0,
  expresion = "serio",
}) => (
  <g transform={`translate(${x},${y}) scale(${escala})`} strokeLinejoin="round">
    <g transform={`rotate(${-brazosArriba * 150}, -70, 140)`}>
      <rect x={-110} y={130} width={56} height={200} rx={28} fill={ropa} stroke={T} strokeWidth={TRAZO} />
    </g>
    <g transform={`rotate(${brazosArriba * 150}, 70, 140)`}>
      <rect x={54} y={130} width={56} height={200} rx={28} fill={ropa} stroke={T} strokeWidth={TRAZO} />
    </g>
    <rect x={-60} y={340} width={50} height={230} rx={22} fill="#3E4652" stroke={T} strokeWidth={TRAZO} />
    <rect x={10} y={340} width={50} height={230} rx={22} fill="#3E4652" stroke={T} strokeWidth={TRAZO} />
    <path d="M-80 360 L-80 160 Q-80 110 -30 110 L30 110 Q80 110 80 160 L80 360 Z" fill={ropa} stroke={T} strokeWidth={TRAZO} />
    <path d="M-80 0 Q-90 -110 0 -112 Q90 -110 80 0 L80 60 L-80 60 Z" fill={pelo} stroke={T} strokeWidth={TRAZO} />
    <ellipse cx={0} cy={10} rx={70} ry={82} fill={piel} stroke={T} strokeWidth={TRAZO} />
    <path d="M-72 -10 Q-60 -80 0 -78 Q60 -80 72 -10 Q40 -50 0 -46 Q-40 -50 -72 -10 Z" fill={pelo} />
    <circle cx={-26} cy={10} r={8} fill={T} />
    <circle cx={26} cy={10} r={8} fill={T} />
    {expresion === "sonrisa" && <path d="M-26 44 Q0 66 26 44" stroke={T} strokeWidth={5} fill="none" strokeLinecap="round" />}
    {expresion === "grito" && <ellipse cx={0} cy={50} rx={14} ry={18} fill="#5A2320" stroke={T} strokeWidth={4} />}
    {expresion === "serio" && <path d="M-20 50 L20 50" stroke={T} strokeWidth={5} strokeLinecap="round" />}
  </g>
);

/** Estrellas del cielo nocturno */
export const Estrellas: React.FC<{ f: number; n?: number; h?: number }> = ({ f, n = 70, h = 900 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const r = (k: string) => random(`est-${i}-${k}`);
      const brillo = 0.5 + 0.5 * Math.sin(f / (6 + r("p") * 10) + r("f") * 6);
      return <circle key={i} cx={r("x") * 1080} cy={r("y") * h} r={1.5 + r("r") * 3} fill="#FFFFFF" opacity={0.3 + brillo * 0.6} />;
    })}
  </g>
);

/** Foco de luz (cono) para escenas nocturnas */
export const Foco: React.FC<{ id: string; x: number; y: number; ang: number; largo?: number; abertura?: number }> = (p) => (
  <Haz {...p} abertura={p.abertura ?? 14} largo={p.largo ?? 1600} intensidad={0.8} />
);

/** Cápsula Fénix (blanca con franjas rojas y azules) */
export const Capsula: React.FC<{ x: number; y: number; escala?: number; abierta?: number }> = ({ x, y, escala = 1, abierta = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${escala})`} strokeLinejoin="round">
    <path d="M-12 -330 L12 -330 L12 -240 L-12 -240 Z" fill="#8A8F94" stroke={T} strokeWidth={5} />
    <path d="M-80 -250 Q0 -300 80 -250 L80 -230 L-80 -230 Z" fill="#E9ECEE" stroke={T} strokeWidth={TRAZO} />
    <rect x={-80} y={-235} width={160} height={480} rx={20} fill="#F4F6F7" stroke={T} strokeWidth={TRAZO} />
    <rect x={-80} y={-170} width={160} height={36} fill={COLOR.rojoChile} stroke={T} strokeWidth={4} />
    <rect x={-80} y={-134} width={160} height={36} fill={COLOR.azulChile} stroke={T} strokeWidth={4} />
    <rect x={-80} y={120} width={160} height={36} fill={COLOR.rojoChile} stroke={T} strokeWidth={4} />
    <rect x={-80} y={156} width={160} height={36} fill={COLOR.azulChile} stroke={T} strokeWidth={4} />
    <rect x={-50} y={-80} width={100} height={180} rx={12} fill={abierta > 0 ? "#2A2F38" : "#C9D3D8"} stroke={T} strokeWidth={5} />
    <path d="M-80 245 L-60 285 L60 285 L80 245 Z" fill="#B8BEC2" stroke={T} strokeWidth={TRAZO} />
    <circle cx={-56} cy={20} r={10} fill="#8A8F94" stroke={T} strokeWidth={3} />
    <circle cx={56} cy={20} r={10} fill="#8A8F94" stroke={T} strokeWidth={3} />
  </g>
);

/** Montaña árida del desierto */
export const Montana: React.FC<{ d: string; color: string; sombra?: string }> = ({ d, color, sombra }) => (
  <g>
    <path d={d} fill={color} stroke={T} strokeWidth={TRAZO} strokeLinejoin="round" />
    {sombra && <path d={d} fill={sombra} opacity={0.25} transform="translate(30 0) scale(0.92 1)" />}
  </g>
);
