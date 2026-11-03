// Escenas del Guion 5 (los 33 mineros). Cada escena dibuja un lienzo de 1080 x 1920;
// la cámara (encuadre, zoom, punch-in) se aplica desde la composición.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { Calendario, CifraGigante, CuadriculaMineros, Llamada } from "../componentes/Rotulos";
import { COLOR, FUENTE } from "../estilo/tokens";
import {
  BanderaChile,
  Capsula,
  Estrellas,
  Foco,
  Haz,
  Minero,
  Montana,
  ParedRoca,
  Persona,
  Polvo,
  Roca,
  T,
  TRAZO,
  Tienda,
  Vela,
} from "./dibujos";

export type PropsEscena = {
  f: number; // fotogramas desde que empieza la escena
  dur: number; // duración de la escena en fotogramas
  m: Record<string, number>; // marcas (fotogramas desde el inicio de la escena)
  datos?: Record<string, string | number>;
};

const Lienzo: React.FC<React.PropsWithChildren<{ html?: React.ReactNode }>> = ({ children, html }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", overflow: "visible" }}>
      {children}
    </svg>
    {html}
  </AbsoluteFill>
);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const etiquetaMapa = (t: string, x: number, y: number, tam = 46, color: string = COLOR.blanco) => (
  <text
    x={x}
    y={y}
    fontFamily={FUENTE}
    fontWeight={900}
    fontSize={tam}
    fill={color}
    stroke={T}
    strokeWidth={9}
    paintOrder="stroke"
    textAnchor="middle"
    style={{ textTransform: "uppercase" }}
  >
    {t}
  </text>
);

// 1 · Gancho: primer plano de minero en la oscuridad, enciende la linterna
export const Gancho: React.FC<PropsEscena> = ({ f }) => {
  const luz = interpolate(f, [2, 3, 4, 5, 6, 9], [0, 1, 0.2, 1, 0.6, 1], clamp);
  return (
    <Lienzo>
      <ParedRoca semilla="gancho" oscuro={0.45} />
      <Haz id="haz-gancho" x={540} y={776} ang={-58} largo={1500} abertura={22} intensidad={luz} />
      <Polvo f={f} n={70} semilla="g1" x0={300} y0={0} w={780} h={800} tam={1.2} />
      <Minero x={540} y={1000} escala={1.6} expresion="miedo" lampara={luz} polvo={0.9} sudor mirada={[0, 2]} />
      <Polvo f={f} n={30} semilla="g2" color={COLOR.luz} velocidad={0.6} />
    </Lienzo>
  );
};

// 2 · Calendario genérico sobre pared de tablones
export const CalendarioEscena: React.FC<PropsEscena> = ({ f, datos }) => (
  <Lienzo
    html={
      <Calendario
        f={f}
        desde={0}
        x={540}
        y={820}
        cabecera={String(datos?.cabecera ?? "")}
        numero={String(datos?.numero ?? "")}
        mes={datos?.mes ? String(datos.mes) : undefined}
        ancho={560}
      />
    }
  >
    <rect x={-1500} y={-1500} width={4080} height={4920} fill="#4A3527" />
    {Array.from({ length: 16 }).map((_, i) => (
      <line key={i} x1={-600 + i * 150} y1={-1500} x2={-600 + i * 150} y2={1480} stroke="#3B2A1E" strokeWidth={8} />
    ))}
    <rect x={-1500} y={1480} width={4080} height={2000} fill="#35261C" />
    <line x1={-1500} y1={1480} x2={2580} y2={1480} stroke={T} strokeWidth={TRAZO} />
  </Lienzo>
);

// 3 · Entrada de la mina en el desierto (plano de dron)
export const MinaExterior: React.FC<PropsEscena> = ({ f }) => (
  <Lienzo>
    <rect x={-1500} y={-1500} width={4080} height={2700} fill={COLOR.cielo} />
    <rect x={-1500} y={700} width={4080} height={500} fill={COLOR.cielo2} />
    <circle cx={850} cy={330} r={150} fill={COLOR.luz} opacity={0.35} />
    <circle cx={850} cy={330} r={95} fill="#FFF6D6" stroke={T} strokeWidth={TRAZO} />
    <Montana d="M-600 1150 L-100 620 L250 900 L520 560 L900 880 L1250 600 L1700 1150 Z" color="#C98B4F" />
    <Montana d="M-600 1500 L-200 980 L200 1100 L540 780 L880 1080 L1300 900 L1700 1500 Z" color="#B5713A" />
    <rect x={-1500} y={1380} width={4080} height={2000} fill="#D9A86A" />
    <line x1={-1500} y1={1380} x2={2580} y2={1380} stroke={T} strokeWidth={TRAZO} />
    {/* boca de la mina */}
    <path d="M400 1390 L400 1170 Q540 1050 680 1170 L680 1390 Z" fill="#6B5440" stroke={T} strokeWidth={TRAZO} />
    <path d="M440 1390 L440 1190 Q540 1100 640 1190 L640 1390 Z" fill="#140F0C" stroke={T} strokeWidth={TRAZO} />
    <rect x={385} y={1150} width={310} height={36} rx={8} fill="#8A6A4E" stroke={T} strokeWidth={5} />
    {/* camino y camión */}
    <path d="M540 1390 Q470 1560 640 1700 Q820 1850 700 2100 L1000 2100 Q1080 1850 860 1700 Q700 1580 640 1390 Z" fill="#C79458" />
    <g transform={`translate(${interpolate(f, [0, 90], [260, 300])}, 1560)`}>
      <rect x={0} y={0} width={190} height={90} rx={10} fill={COLOR.casco} stroke={T} strokeWidth={TRAZO} />
      <rect x={130} y={-50} width={80} height={70} rx={10} fill={COLOR.casco} stroke={T} strokeWidth={TRAZO} />
      <rect x={150} y={-36} width={44} height={30} rx={5} fill={COLOR.cielo2} stroke={T} strokeWidth={4} />
      <circle cx={40} cy={95} r={26} fill="#2B2B2B" stroke={T} strokeWidth={5} />
      <circle cx={160} cy={95} r={26} fill="#2B2B2B" stroke={T} strokeWidth={5} />
    </g>
    <Polvo f={f} n={20} semilla="calima" color="#FFFFFF" y0={900} h={700} velocidad={0.4} />
  </Lienzo>
);

// 4 · Mapa de Chile con el desierto de Atacama
export const MapaChile: React.FC<PropsEscena> = ({ f, m }) => {
  const pin = interpolate(f, [4, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const pulso = (f % 30) / 30;
  const chile = m.chile ?? 9999;
  return (
    <Lienzo>
      <rect x={-1500} y={-1500} width={4080} height={4920} fill="#6E9DA6" />
      <path d="M470 -200 L1600 -200 L1600 2300 L560 2300 Q520 1900 560 1600 Q600 1300 520 1000 Q470 700 520 400 Q540 150 470 -200 Z" fill="#E8D3A6" stroke={T} strokeWidth={TRAZO} />
      {/* Chile: franja larga junto a la costa */}
      <path d="M380 -200 L470 -200 Q540 150 520 400 Q470 700 520 1000 Q600 1300 560 1600 Q520 1900 560 2300 L470 2300 Q420 1900 450 1600 Q480 1300 410 1000 Q370 700 420 400 Q440 150 380 -200 Z" fill="#D9B98A" stroke={T} strokeWidth={TRAZO} />
      {/* Atacama */}
      <path d="M418 330 Q440 200 400 60 L480 60 Q530 220 518 420 Q500 560 470 680 L420 680 Q390 520 418 330 Z" fill={COLOR.ocre} stroke={T} strokeWidth={5} opacity={0.95} />
      <text x={200} y={1100} fontFamily={FUENTE} fontWeight={800} fontSize={40} fill="#FFFFFF" opacity={0.55} textAnchor="middle" transform="rotate(-90 200 1100)" letterSpacing={6}>
        OCÉANO PACÍFICO
      </text>
      {etiquetaMapa("ATACAMA", 720, 330, 54)}
      {etiquetaMapa("ARGENTINA", 850, 1420, 40, "#8A7A5A")}
      {etiquetaMapa("BOLIVIA", 860, 110, 40, "#8A7A5A")}
      {f >= chile && etiquetaMapa("CHILE", 720, 770, 80, COLOR.rojo)}
      {/* mina San José */}
      <g transform={`translate(468, 600)`}>
        <circle r={20 + pulso * 50} fill="none" stroke={COLOR.rojo} strokeWidth={6} opacity={1 - pulso} />
        <g transform={`scale(${pin})`}>
          <circle r={20} fill={COLOR.rojo} stroke={T} strokeWidth={5} />
          <circle r={7} fill={COLOR.blanco} />
        </g>
      </g>
      {pin > 0.5 && etiquetaMapa("MINA SAN JOSÉ", 760, 615, 42)}
      <Polvo f={f} n={14} semilla="mar" color="#FFFFFF" x0={0} w={380} velocidad={0.3} />
    </Lienzo>
  );
};

// 5 · Túnel: calma y derrumbe
export const Derrumbe: React.FC<PropsEscena> = ({ f, m }) => {
  const d = m.derrumba ?? 9999;
  const t = f - d;
  const nube = interpolate(t, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const caida = (i: number) => {
    const ti = t - random(`c${i}`) * 10;
    return ti < 0 ? -400 : -200 + 0.9 * ti * ti;
  };
  return (
    <Lienzo>
      <ParedRoca semilla="tunel" oscuro={0.3} />
      <path d="M260 1700 L260 700 Q540 420 820 700 L820 1700 Z" fill="#120E0B" stroke={T} strokeWidth={TRAZO} />
      {/* entibados de madera */}
      {[0, 1].map((k) => {
        const s = 1 - k * 0.35;
        return (
          <g key={k} transform={`translate(540, 1200) scale(${s}) translate(-540, -1200)`} opacity={1 - k * 0.3}>
            <rect x={240} y={640} width={60} height={1100} fill="#6B5440" stroke={T} strokeWidth={TRAZO} />
            <rect x={780} y={640} width={60} height={1100} fill="#6B5440" stroke={T} strokeWidth={TRAZO} />
            <rect x={200} y={600} width={680} height={64} fill="#7C6047" stroke={T} strokeWidth={TRAZO} />
          </g>
        );
      })}
      <Haz id="haz-t1" x={430} y={1130} ang={-100} largo={700} abertura={18} intensidad={0.8} />
      <Haz id="haz-t2" x={680} y={1170} ang={-80} largo={700} abertura={18} intensidad={0.8} />
      <Minero x={430} y={1250} escala={0.55} cuerpo="entero" lampara={1} expresion={t >= 0 ? "grito" : "serio"} polvo={0.6} />
      <Minero x={680} y={1290} escala={0.55} cuerpo="entero" lampara={1} expresion={t >= 0 ? "grito" : "serio"} polvo={0.6} flip bigote />
      {/* rocas cayendo */}
      {t >= 0 &&
        Array.from({ length: 16 }).map((_, i) => (
          <Roca key={i} semilla={`r${i}`} x={180 + random(`rx${i}`) * 720} y={caida(i)} r={40 + random(`rr${i}`) * 70} rot={t * (random(`rv${i}`) * 6 - 3)} color={i % 2 ? COLOR.roca3 : COLOR.roca4} />
        ))}
      {/* nube de polvo */}
      {t >= 0 && (
        <g opacity={0.92 * nube}>
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse
              key={i}
              cx={150 + i * 90 + Math.sin(i + t / 8) * 30}
              cy={700 - i * 10 + random(`ny${i}`) * 300}
              rx={(120 + random(`nr${i}`) * 140) * (0.4 + nube)}
              ry={(90 + random(`nq${i}`) * 90) * (0.4 + nube)}
              fill={i % 2 ? COLOR.polvo : "#B08E66"}
            />
          ))}
        </g>
      )}
      <Polvo f={f} n={t >= 0 ? 120 : 40} semilla="tp" velocidad={t >= 0 ? 4 : 1} />
    </Lienzo>
  );
};

// 6 · Refugio: 33 hombres en una sala pequeña, solo con la luz de los cascos
export const Refugio: React.FC<PropsEscena & { lamparas?: number; cansancio?: boolean }> = ({ f, lamparas = 1, cansancio = false }) => {
  const mineros = [
    { x: 150, y: 1180, e: "cansado", b: true },
    { x: 330, y: 1120, e: "serio", b: false },
    { x: 520, y: 1170, e: "miedo", b: false },
    { x: 720, y: 1110, e: "serio", b: true },
    { x: 910, y: 1180, e: "cansado", b: false },
  ] as const;
  return (
    <Lienzo>
      <ParedRoca semilla="refugio" base="#2E241C" tono="#3E3126" oscuro={0.25} />
      <path d="M-200 900 Q540 600 1280 900 L1280 2200 L-200 2200 Z" fill="#3A2E24" />
      <rect x={-1500} y={1500} width={4080} height={2000} fill="#4E3D2E" />
      <line x1={-1500} y1={1500} x2={2580} y2={1500} stroke={T} strokeWidth={TRAZO} />
      {[90, 240, 400, 560, 700, 860, 1000].map((x, i) => (
        <g key={`fondo${i}`} opacity={0.75}>
          <Minero x={x} y={930 + (i % 2) * 30} escala={0.3} cuerpo="cabeza" lampara={lamparas * 0.6} expresion={cansancio ? "cansado" : "serio"} polvo={1} flip={i % 2 === 0} />
        </g>
      ))}
      <rect x={-1500} y={800} width={4080} height={300} fill="#000" opacity={0.25} />
      {mineros.map((mm, i) => (
        <Haz key={`h${i}`} id={`haz-r${i}`} x={mm.x} y={mm.y - 63} ang={-90 + (i - 2) * 12} largo={600} abertura={16} intensidad={0.55 * lamparas} />
      ))}
      {mineros.map((mm, i) => (
        <Minero
          key={i}
          x={mm.x}
          y={mm.y}
          escala={0.45}
          cuerpo="sentado"
          lampara={lamparas}
          expresion={cansancio ? "cansado" : mm.e}
          polvo={0.9}
          bigote={mm.b}
          delgado={cansancio ? 1 : 0}
          flip={i % 2 === 1}
          mirada={[i < 2 ? 4 : -4, 4]}
        />
      ))}
      {/* charcos de luz en el suelo */}
      {mineros.map((mm, i) => (
        <ellipse key={`l${i}`} cx={mm.x} cy={1560} rx={120} ry={26} fill={COLOR.luz} opacity={0.12 * lamparas} />
      ))}
      <Polvo f={f} n={60} semilla="rp" y0={500} h={1100} />
      <rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={cansancio ? 0.25 : 0} />
    </Lienzo>
  );
};

// 7 · Comida: latas y galletas para dos o tres días
export const Comida: React.FC<PropsEscena> = ({ f }) => (
  <Lienzo>
    <ParedRoca semilla="comida" base="#2A211A" tono="#352A21" oscuro={0.2} />
    <rect x={-1500} y={1200} width={4080} height={2000} fill="#5A4636" />
    <line x1={-1500} y1={1200} x2={2580} y2={1200} stroke={T} strokeWidth={TRAZO} />
    <Haz id="haz-c" x={-100} y={300} ang={45} largo={1600} abertura={18} intensidad={0.7} />
    {/* latas */}
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${250 + i * 150}, ${1080 - (i % 2) * 20})`}>
        <rect x={-60} y={-110} width={120} height={150} rx={12} fill="#B8BEC2" stroke={T} strokeWidth={TRAZO} />
        <rect x={-60} y={-80} width={120} height={70} fill={COLOR.rojo} stroke={T} strokeWidth={4} />
        <ellipse cx={0} cy={-110} rx={60} ry={14} fill="#D5DADD" stroke={T} strokeWidth={5} />
      </g>
    ))}
    {/* caja de galletas */}
    <g transform="translate(760, 1000)">
      <rect x={-130} y={-150} width={260} height={200} rx={8} fill="#E8C26A" stroke={T} strokeWidth={TRAZO} />
      <rect x={-90} y={-110} width={180} height={70} rx={8} fill="#F6EEDC" stroke={T} strokeWidth={4} />
      <circle cx={-40} cy={-75} r={18} fill="#C98B4F" stroke={T} strokeWidth={3} />
      <circle cx={10} cy={-75} r={18} fill="#C98B4F" stroke={T} strokeWidth={3} />
      <circle cx={60} cy={-75} r={18} fill="#C98B4F" stroke={T} strokeWidth={3} />
    </g>
    {/* botellas */}
    {[0, 1].map((i) => (
      <g key={`b${i}`} transform={`translate(${420 + i * 110}, 1150)`}>
        <rect x={-36} y={-200} width={72} height={200} rx={20} fill="#BFE0E8" opacity={0.9} stroke={T} strokeWidth={TRAZO} />
        <rect x={-18} y={-240} width={36} height={44} rx={6} fill="#3F6E8C" stroke={T} strokeWidth={5} />
      </g>
    ))}
    <Polvo f={f} n={40} semilla="cp" x0={0} y0={300} h={900} />
  </Lienzo>
);

// 8 · Infografía oscura con 33 iconos
export const Cuadricula: React.FC<PropsEscena> = ({ f, datos, dur }) => {
  const de = Number(datos?.de ?? 0);
  const a = Number(datos?.a ?? 0);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -1080, top: -1920, width: 3240, height: 5760, background: COLOR.pizarra }} />
      <CifraGigante f={f} desde={0} texto={String(datos?.cifra ?? "33")} y={360} tamano={Number(datos?.tamano ?? 260)} />
      <CuadriculaMineros f={f} desde={2} total={33} de={de} a={a} fotogramas={Math.max(10, dur - 12)} y={600} />
    </AbsoluteFill>
  );
};

// 9 · Luis Urzúa, jefe de turno
export const Urzua: React.FC<PropsEscena> = () => (
  <Lienzo>
    <ParedRoca semilla="urzua" base="#2E241C" tono="#3E3126" oscuro={0.35} />
    <circle cx={540} cy={900} r={520} fill="#5A4636" opacity={0.7} />
    <circle cx={540} cy={900} r={520} fill="none" stroke={COLOR.luz} strokeWidth={4} opacity={0.15} />
    <Minero x={540} y={860} escala={1.25} expresion="serio" lampara={1} polvo={0.7} bigote casco="#F1F1EC" piel={COLOR.piel2} pelo="#6E6A66" />
  </Lienzo>
);

// 10 · Dos cucharadas de atún cada dos días
export const Atun: React.FC<PropsEscena> = ({ f }) => {
  const cuchara = interpolate(f, [0, 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <Lienzo>
      <rect x={-1500} y={-1500} width={4080} height={4920} fill="#5A4636" />
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse key={i} cx={random(`a${i}`) * 1080} cy={random(`b${i}`) * 1920} rx={140} ry={80} fill="#4E3D2E" opacity={0.7} />
      ))}
      <Haz id="haz-a" x={540} y={-200} ang={90} largo={2000} abertura={20} intensidad={0.55} />
      {/* vasitos */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${160 + i * 190}, 1540)`}>
          <path d="M-60 -110 L60 -110 L46 40 L-46 40 Z" fill="#F4F1EA" opacity={0.92} stroke={T} strokeWidth={TRAZO} strokeLinejoin="round" />
          {i < Math.round(cuchara * 5) && <ellipse cx={0} cy={-80} rx={40} ry={14} fill="#C9A06A" stroke={T} strokeWidth={3} />}
        </g>
      ))}
      {/* lata de atún abierta */}
      <g transform="translate(540, 840) scale(1.35)">
        <ellipse cx={0} cy={60} rx={220} ry={80} fill="#9AA1A6" stroke={T} strokeWidth={TRAZO} />
        <rect x={-220} y={-20} width={440} height={80} fill="#B8BEC2" />
        <rect x={-220} y={0} width={440} height={50} fill={COLOR.rojo} stroke={T} strokeWidth={4} />
        <ellipse cx={0} cy={-20} rx={220} ry={80} fill="#D5DADD" stroke={T} strokeWidth={TRAZO} />
        <ellipse cx={0} cy={-20} rx={185} ry={62} fill="#C9A06A" stroke={T} strokeWidth={5} />
        <path d="M-90 -30 Q-40 -60 10 -30 Q60 -50 100 -20" stroke="#A9814F" strokeWidth={8} fill="none" />
      </g>
      {/* mano con cuchara */}
      <g transform={`translate(${interpolate(cuchara, [0, 1], [700, 560])}, ${interpolate(cuchara, [0, 0.5, 1], [700, 640, 700])}) rotate(-25)`}>
        <rect x={-14} y={-20} width={28} height={300} rx={14} fill="#C9CED1" stroke={T} strokeWidth={5} />
        <ellipse cx={0} cy={-40} rx={46} ry={34} fill="#C9CED1" stroke={T} strokeWidth={5} />
        <ellipse cx={0} cy={-44} rx={30} ry={18} fill="#C9A06A" />
        <rect x={-75} y={330} width={150} height={420} rx={40} fill={COLOR.mono} stroke={T} strokeWidth={TRAZO} />
        <ellipse cx={0} cy={250} rx={78} ry={96} fill={COLOR.piel2} stroke={T} strokeWidth={TRAZO} />
        <path d="M-60 210 Q0 190 60 210 M-64 250 Q0 230 64 250 M-60 290 Q0 270 60 290" stroke={T} strokeWidth={4} fill="none" />
        <ellipse cx={20} cy={260} rx={30} ry={18} fill="#5B4330" opacity={0.35} />
      </g>
    </Lienzo>
  );
};

// 11 · Campamento Esperanza al atardecer
export const Campamento: React.FC<PropsEscena> = ({ f }) => (
  <Lienzo>
    <rect x={-1500} y={-1500} width={4080} height={1900} fill="#6E5A8C" />
    <rect x={-1500} y={400} width={4080} height={400} fill="#C77A6E" />
    <rect x={-1500} y={800} width={4080} height={500} fill="#F2A65A" />
    <circle cx={700} cy={1240} r={190} fill="#FFD27A" stroke={T} strokeWidth={TRAZO} />
    <Montana d="M-600 1300 L-100 1050 L300 1180 L700 980 L1100 1170 L1700 1050 L1700 1300 Z" color="#8C5A4A" />
    <rect x={-1500} y={1290} width={4080} height={2000} fill="#D9A86A" />
    <line x1={-1500} y1={1290} x2={2580} y2={1290} stroke={T} strokeWidth={TRAZO} />
    <Tienda x={120} y={1420} escala={0.8} color="#3F6E8C" />
    <Tienda x={430} y={1390} escala={0.6} color="#5E7D4E" />
    <Tienda x={980} y={1430} escala={0.85} color={COLOR.mono} />
    <BanderaChile x={260} y={1000} escala={0.75} f={f} />
    <BanderaChile x={700} y={1040} escala={0.65} f={f} fase={8} />
    <BanderaChile x={-80} y={1060} escala={0.6} f={f} fase={15} />
    <Persona x={330} y={1560} escala={0.62} ropa="#7A4E8C" />
    <Persona x={520} y={1600} escala={0.5} ropa="#3F6E8C" pelo="#5A3A22" />
    <Persona x={760} y={1560} escala={0.62} ropa="#A6463C" />
    {[...Array(14)].map((_, i) => (
      <Vela key={i} x={120 + (i % 7) * 140 + (i > 6 ? 70 : 0)} y={1820 + (i > 6 ? 70 : 0)} f={f} escala={0.8} fase={i * 5} />
    ))}
    <Vela x={300} y={1690} f={f} escala={0.9} />
    <Vela x={810} y={1690} f={f} escala={0.9} fase={7} />
  </Lienzo>
);

// 12 · La sonda perfora el techo del refugio
export const Sonda: React.FC<PropsEscena> = ({ f, m }) => {
  const p = m.perfora ?? 9999;
  const t = f - p;
  const baja = interpolate(t, [0, 12], [-260, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const gira = f * 25;
  return (
    <Lienzo>
      <ParedRoca semilla="techo" base="#2A211A" tono="#3A2E24" oscuro={0.2} />
      <path d="M-300 -300 L1380 -300 L1380 560 Q1080 640 800 590 Q540 660 280 600 Q60 640 -300 560 Z" fill="#4E3D2E" stroke={T} strokeWidth={TRAZO} />
      {/* grietas */}
      <path d="M540 610 L500 520 L560 430 L520 320 M540 610 L620 540 L600 450" stroke={T} strokeWidth={5} fill="none" opacity={interpolate(t, [-30, 0], [0.2, 1], clamp)} />
      {/* broca */}
      {t >= -2 && (
        <g transform={`translate(540, ${610 + baja})`}>
          <rect x={-40} y={-600} width={80} height={560} fill="#9AA1A6" stroke={T} strokeWidth={TRAZO} />
          <path d="M-70 -60 L70 -60 L0 120 Z" fill="#C9CED1" stroke={T} strokeWidth={TRAZO} strokeLinejoin="round" />
          <path d={`M-50 ${-40 + (gira % 40)} L50 ${-10 + (gira % 40)} M-35 ${10 + (gira % 40)} L35 ${36 + (gira % 40)}`} stroke={T} strokeWidth={5} />
        </g>
      )}
      {/* chispas */}
      {t >= 0 && t < 40 &&
        Array.from({ length: 18 }).map((_, i) => {
          const a = random(`ch${i}`) * Math.PI;
          const r = 40 + ((t * 9 + random(`cl${i}`) * 80) % 200);
          return (
            <line
              key={i}
              x1={540 + Math.cos(a) * r * 0.6}
              y1={640 + Math.sin(a) * r * 0.6}
              x2={540 + Math.cos(a) * r}
              y2={640 + Math.sin(a) * r}
              stroke="#FFC23D"
              strokeWidth={6}
              strokeLinecap="round"
            />
          );
        })}
      {t >= 0 && Array.from({ length: 6 }).map((_, i) => <Roca key={i} semilla={`sr${i}`} x={420 + i * 45} y={640 + t * (10 + i * 3)} r={14 + (i % 3) * 8} />)}
      <Polvo f={f} n={t >= 0 ? 90 : 30} semilla="sp" velocidad={t >= 0 ? 3 : 0.8} />
      <Minero x={250} y={1470} escala={1} cuerpo="cabeza" expresion={t >= 0 ? "asombro" : "cansado"} lampara={0.6} polvo={1} mirada={[6, -10]} />
      <Minero x={830} y={1500} escala={1} cuerpo="cabeza" expresion={t >= 0 ? "asombro" : "cansado"} lampara={0.6} polvo={1} mirada={[-6, -10]} bigote />
    </Lienzo>
  );
};

// 13 · En la superficie sacan la sonda
export const SuperficieSonda: React.FC<PropsEscena> = ({ f }) => {
  const sube = interpolate(f, [0, 45], [380, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <Lienzo>
      <rect x={-1500} y={-1500} width={4080} height={2600} fill={COLOR.cielo} />
      <Montana d="M-600 1100 L-100 820 L400 980 L800 760 L1700 1100 Z" color="#C98B4F" />
      <rect x={-1500} y={1080} width={4080} height={2000} fill="#D9A86A" />
      <line x1={-1500} y1={1080} x2={2580} y2={1080} stroke={T} strokeWidth={TRAZO} />
      {/* torre de perforación */}
      <path d="M440 1150 L520 300 L560 300 L640 1150" fill="none" stroke="#7C8590" strokeWidth={22} />
      <path d="M470 900 L610 900 M490 650 L590 650 M505 450 L575 450" stroke="#7C8590" strokeWidth={14} />
      <path d="M440 1150 L520 300 L560 300 L640 1150" fill="none" stroke={T} strokeWidth={4} />
      <rect x={515} y={420 + sube} width={50} height={760} fill="#9AA1A6" stroke={T} strokeWidth={5} />
      <ellipse cx={540} cy={1170} rx={120} ry={30} fill="#5A4636" stroke={T} strokeWidth={5} />
      <Minero x={250} y={1300} escala={0.42} cuerpo="entero" casco="#F1F1EC" expresion="asombro" polvo={0.2} mirada={[8, -6]} />
      <Minero x={830} y={1320} escala={0.42} cuerpo="entero" casco="#3F6E8C" expresion="asombro" polvo={0.2} mirada={[-8, -6]} flip />
      <Polvo f={f} n={20} semilla="ss" color="#FFFFFF" velocidad={0.5} />
    </Lienzo>
  );
};

// 14 · La nota: «Estamos bien en el refugio los 33»
export const Nota: React.FC<PropsEscena> = ({ f }) => {
  const tiembla = Math.sin(f / 2) * 1.2;
  return (
    <Lienzo
      html={
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 820,
            transform: `translate(-50%, -50%) rotate(${-4 + tiembla * 0.2}deg)`,
            width: 760,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "Mano",
            color: "#D62E22",
            fontSize: 92,
            lineHeight: 1.12,
            textAlign: "center",
          }}
        >
          <span>ESTAMOS BIEN</span>
          <span>EN EL REFUGIO</span>
          <span>LOS 33</span>
        </div>
      }
    >
      <rect x={-1500} y={-1500} width={4080} height={4920} fill={COLOR.arena2} />
      <circle cx={540} cy={820} r={700} fill={COLOR.arena} opacity={0.7} />
      {/* varilla de la sonda */}
      <rect x={480} y={-400} width={120} height={600} fill="#9AA1A6" stroke={T} strokeWidth={TRAZO} />
      <rect x={470} y={160} width={140} height={60} rx={10} fill="#C9CED1" stroke={T} strokeWidth={TRAZO} />
      {/* papel */}
      <g transform={`rotate(${-4 + tiembla * 0.2}, 540, 820)`}>
        <path d="M140 520 L930 500 L950 1130 L120 1150 Z" fill="#F6EEDC" stroke={T} strokeWidth={TRAZO} strokeLinejoin="round" />
        <path d="M520 505 L540 1140 M130 820 L940 800" stroke="#D8CDB6" strokeWidth={6} />
        <rect x={470} y={470} width={140} height={60} rx={6} fill="#E8D9A8" opacity={0.85} stroke={T} strokeWidth={4} />
      </g>
      {/* manos */}
      <g>
        <ellipse cx={120} cy={1180} rx={90} ry={70} fill={COLOR.piel} stroke={T} strokeWidth={TRAZO} />
        <rect x={20} y={1200} width={170} height={600} rx={60} fill="#3F6E8C" stroke={T} strokeWidth={TRAZO} />
        <ellipse cx={960} cy={1160} rx={90} ry={70} fill={COLOR.piel2} stroke={T} strokeWidth={TRAZO} />
        <rect x={880} y={1180} width={170} height={600} rx={60} fill="#7A4E8C" stroke={T} strokeWidth={TRAZO} />
      </g>
    </Lienzo>
  );
};

// 15 · Perforadora gigante de noche
export const PerforadoraNoche: React.FC<PropsEscena> = ({ f }) => (
  <Lienzo>
    <rect x={-1500} y={-1500} width={4080} height={2900} fill={COLOR.noche} />
    <Estrellas f={f} h={1000} />
    <rect x={-1500} y={1350} width={4080} height={2000} fill="#3A2E24" />
    <line x1={-1500} y1={1350} x2={2580} y2={1350} stroke={T} strokeWidth={TRAZO} />
    <Foco id="foco1" x={150} y={1150} ang={-60} />
    <Foco id="foco2" x={930} y={1150} ang={-120} />
    {/* torre */}
    <g>
      <path d="M380 1400 L500 200 L580 200 L700 1400" fill="none" stroke="#7C8590" strokeWidth={30} />
      {[1250, 1050, 850, 650, 450, 300].map((yy, i) => (
        <line key={i} x1={400 + (1400 - yy) * 0.1 - 10} y1={yy} x2={680 - (1400 - yy) * 0.1 + 10} y2={yy} stroke="#7C8590" strokeWidth={16} />
      ))}
      <path d="M380 1400 L500 200 L580 200 L700 1400" fill="none" stroke={T} strokeWidth={4} />
      <rect x={300} y={1240} width={480} height={160} rx={12} fill={COLOR.casco} stroke={T} strokeWidth={TRAZO} />
      <rect x={340} y={1270} width={120} height={60} rx={6} fill={COLOR.luz} stroke={T} strokeWidth={4} />
    </g>
    {/* vapor */}
    {Array.from({ length: 6 }).map((_, i) => (
      <ellipse key={i} cx={540 + Math.sin(i * 2 + f / 20) * 80} cy={1200 - ((f * 2 + i * 120) % 700)} rx={120 + i * 10} ry={70} fill="#D7DCDF" opacity={0.25} />
    ))}
    <circle cx={150} cy={1150} r={40} fill={COLOR.luz} stroke={T} strokeWidth={5} />
    <circle cx={930} cy={1150} r={40} fill={COLOR.luz} stroke={T} strokeWidth={5} />
    <Minero x={180} y={1500} escala={0.32} cuerpo="entero" casco="#F1F1EC" expresion="serio" polvo={0.3} />
    <Minero x={900} y={1520} escala={0.32} cuerpo="entero" casco={COLOR.casco} expresion="serio" polvo={0.3} flip />
  </Lienzo>
);

// 16 · Corte transversal: túnel de rescate de 700 metros
export const CorteTransversal: React.FC<PropsEscena> = ({ f, m }) => {
  const ini = m.excavar ?? 0;
  const fin = m.roca ?? ini + 40;
  const p = interpolate(f, [ini, fin], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const y0 = 330;
  const y1 = 1640;
  const yy = y0 + (y1 - y0) * p;
  const capas = ["#8A6A4E", "#6B5440", "#7C6047", "#5A4636", "#6B5440", "#4E3D2E"];
  return (
    <Lienzo>
      <rect x={-1500} y={-1500} width={4080} height={1830} fill={COLOR.cielo} />
      {capas.map((c, i) => (
        <path
          key={i}
          d={`M-600 ${y0 + i * 230} Q300 ${y0 + i * 230 - 40} 540 ${y0 + i * 230 + 10} Q800 ${y0 + i * 230 + 50} 1700 ${y0 + i * 230} L1700 2600 L-600 2600 Z`}
          fill={c}
          stroke={T}
          strokeWidth={5}
        />
      ))}
      <line x1={-600} y1={y0} x2={1700} y2={y0} stroke={T} strokeWidth={TRAZO} />
      {/* torre pequeña en superficie */}
      <path d="M500 330 L530 170 L550 170 L580 330" fill="none" stroke="#7C8590" strokeWidth={12} />
      <path d="M500 330 L530 170 L550 170 L580 330" fill="none" stroke={T} strokeWidth={3} />
      {/* refugio */}
      <ellipse cx={540} cy={1700} rx={190} ry={80} fill="#1E1712" stroke={T} strokeWidth={TRAZO} />
      <ellipse cx={540} cy={1700} rx={150} ry={55} fill={COLOR.luz} opacity={0.18} />
      {[-90, -30, 30, 90].map((dx, i) => (
        <g key={i} transform={`translate(${540 + dx}, 1712)`}>
          <circle r={14} fill={COLOR.piel} />
          <path d="M-18 -4 Q-18 -26 0 -26 Q18 -26 18 -4 Z" fill={COLOR.casco} />
        </g>
      ))}
      {/* túnel que avanza */}
      <line x1={540} y1={y0} x2={540} y2={yy} stroke="#120E0B" strokeWidth={34} strokeLinecap="round" />
      <line x1={540} y1={y0} x2={540} y2={yy} stroke={COLOR.casco} strokeWidth={8} strokeDasharray="20 18" />
      {/* regla de profundidad */}
      <line x1={900} y1={y0} x2={900} y2={y1 + 40} stroke={COLOR.blanco} strokeWidth={6} />
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <line x1={880} y1={y0 + (i * (y1 + 40 - y0)) / 7} x2={920} y2={y0 + (i * (y1 + 40 - y0)) / 7} stroke={COLOR.blanco} strokeWidth={6} />
          {etiquetaMapa(`${i * 100}`, 980, y0 + (i * (y1 + 40 - y0)) / 7 + 14, 34)}
        </g>
      ))}
      {p > 0.98 && (
        <g>
          <rect x={700} y={1520} width={280} height={84} rx={12} fill={COLOR.rojo} stroke={T} strokeWidth={4} />
          {etiquetaMapa("700 M", 840, 1578, 50)}
        </g>
      )}
    </Lienzo>
  );
};

// 17 · La cápsula Fénix colgando de la grúa
export const Fenix: React.FC<PropsEscena> = ({ f, m }) => {
  const baja = m.subirlos !== undefined ? interpolate(f, [m.subirlos, m.subirlos + 50], [0, 520], { ...clamp, easing: Easing.inOut(Easing.quad) }) : 0;
  const cy = 860 + baja;
  return (
    <Lienzo
      html={
        m.fenix !== undefined ? (
          <Llamada f={f} desde={m.fenix} x={540} y={300} texto="CÁPSULA FÉNIX" px={600} py={cy - 120} />
        ) : null
      }
    >
      <rect x={-1500} y={-1500} width={4080} height={2900} fill={COLOR.noche2} />
      <Estrellas f={f} n={40} h={700} />
      <Foco id="foco-f" x={-50} y={1300} ang={-50} abertura={12} />
      {/* grúa */}
      <path d="M-300 120 L740 120" stroke="#E8C26A" strokeWidth={50} />
      <path d="M-300 120 L740 120" stroke={T} strokeWidth={4} strokeDasharray="0" fill="none" />
      <line x1={540} y1={140} x2={540} y2={cy - 330} stroke="#2B2B2B" strokeWidth={8} />
      <rect x={-1500} y={1450} width={4080} height={2000} fill="#3A2E24" />
      <line x1={-1500} y1={1450} x2={2580} y2={1450} stroke={T} strokeWidth={TRAZO} />
      <Capsula x={540} y={cy} escala={1} />
      {/* boca del pozo (por delante de la cápsula cuando baja) */}
      <path d="M300 1450 L780 1450 L780 2100 L300 2100 Z" fill="#3A2E24" />
      <ellipse cx={540} cy={1450} rx={240} ry={60} fill="#120E0B" stroke={T} strokeWidth={TRAZO} />
      <ellipse cx={540} cy={1450} rx={260} ry={70} fill="none" stroke="#9AA1A6" strokeWidth={18} />
    </Lienzo>
  );
};

// 18 · Sale el primer minero y abraza a su familia
export const Salida: React.FC<PropsEscena> = ({ f }) => (
  <Lienzo>
    <rect x={-1500} y={-1500} width={4080} height={2900} fill="#2A3245" />
    <Foco id="foco-s1" x={-100} y={900} ang={-20} abertura={16} />
    <Foco id="foco-s2" x={1180} y={900} ang={-160} abertura={16} />
    <rect x={-1500} y={1400} width={4080} height={2000} fill="#5A4636" />
    <line x1={-1500} y1={1400} x2={2580} y2={1400} stroke={T} strokeWidth={TRAZO} />
    <BanderaChile x={60} y={700} escala={0.8} f={f} />
    <BanderaChile x={880} y={720} escala={0.7} f={f} fase={10} />
    <Persona x={130} y={1180} escala={0.5} ropa="#3F6E8C" brazosArriba={0.8} expresion="grito" />
    <Persona x={950} y={1190} escala={0.5} ropa="#A6463C" brazosArriba={0.8} expresion="grito" pelo="#5A3A22" />
    <Capsula x={250} y={1080} escala={0.75} abierta={1} />
    <ellipse cx={250} cy={1300} rx={170} ry={44} fill="#120E0B" stroke={T} strokeWidth={TRAZO} />
    <Persona x={700} y={1060} escala={0.82} ropa="#7A4E8C" expresion="sonrisa" />
    <Minero x={520} y={860} escala={0.7} cuerpo="entero" gafas expresion="alivio" polvo={0.9} lampara={0.5} brazosArriba={0.35} />
  </Lienzo>
);

// 19 · Equipo: los mineros juntos
export const Equipo: React.FC<PropsEscena> = () => {
  const xs = [140, 340, 540, 740, 940];
  return (
    <Lienzo>
      <rect x={-1500} y={-1500} width={4080} height={4920} fill="#AA8550" />
      <circle cx={540} cy={820} r={720} fill={COLOR.arena2} opacity={0.6} />
      <circle cx={540} cy={820} r={460} fill={COLOR.arena} opacity={0.5} />
      {xs.map((x, i) => (
        <Minero
          key={i}
          x={x}
          y={900 + Math.abs(i - 2) * 40}
          escala={0.62}
          expresion={i === 2 ? "sonrisa" : "alivio"}
          gafas={i === 1 || i === 3}
          bigote={i === 0 || i === 4}
          polvo={0.9}
          lampara={0}
          casco={i === 2 ? "#F1F1EC" : COLOR.casco}
          flip={i > 2}
        />
      ))}
    </Lienzo>
  );
};

// 20 · Primer plano final: gafas oscuras, una lágrima y media sonrisa
export const FinalCara: React.FC<PropsEscena> = ({ f, dur }) => (
  <Lienzo>
    <rect x={-1500} y={-1500} width={4080} height={4920} fill="#8C6A3E" />
    <circle cx={540} cy={860} r={640} fill={COLOR.arena2} opacity={0.65} />
    <circle cx={540} cy={860} r={420} fill={COLOR.luz} opacity={0.25} />
    <Minero x={540} y={900} escala={1.55} gafas expresion="alivio" polvo={0.8} lagrima={interpolate(f, [10, Math.max(20, dur * 0.7)], [0, 1], clamp)} />
  </Lienzo>
);

export const ESCENAS = {
  Gancho,
  CalendarioEscena,
  MinaExterior,
  MapaChile,
  Derrumbe,
  Refugio,
  RefugioCansado: (p: PropsEscena) => <Refugio {...p} lamparas={0.45} cansancio />,
  Comida,
  Cuadricula,
  Urzua,
  Atun,
  Campamento,
  Sonda,
  SuperficieSonda,
  Nota,
  PerforadoraNoche,
  CorteTransversal,
  Fenix,
  Salida,
  Equipo,
  FinalCara,
} satisfies Record<string, React.FC<PropsEscena>>;

export type NombreEscena = keyof typeof ESCENAS;
