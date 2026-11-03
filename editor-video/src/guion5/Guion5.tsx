import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Camara } from "../componentes/Camara";
import { Subtitulos } from "../componentes/Subtitulos";
import { Cartel, Etiqueta, InsigniaDia, Llamada, Pregunta } from "../componentes/Rotulos";
import { crearBloques } from "../estilo/bloques";
import { cargarFuentes } from "../estilo/fuentes";
import { COLOR, FPS, TRANS } from "../estilo/tokens";
import { ESCENAS } from "./escenas";
import { type PalabraVoz, type PlanoResuelto, type RotuloResuelto, resolverMontaje } from "./montaje";
import { COLA_FINAL_S, DESTACADAS, MUSICA, PLAN } from "./plan";
import palabrasVoz from "../../public/guion5/voz.palabras.json";

cargarFuentes();

export const guion5Schema = z.object({
  voz: z.string(),
  conMusica: z.boolean(),
});

const PALABRAS = palabrasVoz as PalabraVoz[];

export const duracionGuion5 = () => {
  const ultima = PALABRAS[PALABRAS.length - 1];
  return Math.ceil(((ultima.endMs + 450) / 1000 + COLA_FINAL_S) * FPS);
};

const RotuloPantalla: React.FC<{ r: RotuloResuelto; frame: number }> = ({ r, frame }) => {
  if (frame < r.desde || frame >= r.hastaF) return null;
  switch (r.tipo) {
    case "cartel":
      return <Cartel f={frame} desde={r.desde} x={r.x ?? 540} y={r.y ?? 470} linea1={r.linea1} linea2={r.linea2} />;
    case "insignia":
      return <InsigniaDia f={frame} desde={r.desde} x={540} y={316} de={r.de} a={r.a} contarFotogramas={r.contar} />;
    case "pregunta":
      return <Pregunta f={frame} desde={r.desde} linea1={r.linea1} linea2={r.linea2} />;
    default:
      return null;
  }
};

const RotuloEscena: React.FC<{ r: RotuloResuelto; frame: number }> = ({ r, frame }) => {
  if (frame < r.desde || frame >= r.hastaF) return null;
  if (r.tipo === "etiqueta") return <Etiqueta f={frame} desde={r.desde} x={r.x} y={r.y} nombre={r.nombre} dato={r.dato} />;
  if (r.tipo === "llamada") return <Llamada f={frame} desde={r.desde} x={r.x} y={r.y} px={r.px} py={r.py} texto={r.texto} />;
  return null;
};

export const Guion5: React.FC<z.infer<typeof guion5Schema>> = ({ voz, conMusica }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const { planos, escenas, rotulos, sfx, resolver } = useMemo(
    () => resolverMontaje(PLAN, PALABRAS, fps, durationInFrames),
    [fps, durationInFrames],
  );
  const bloques = useMemo(() => crearBloques(PALABRAS, DESTACADAS), []);

  const pregunta = rotulos.find((r) => r.tipo === "pregunta");
  const inicioPregunta = pregunta?.desde ?? durationInFrames;
  const velo = interpolate(frame, [inicioPregunta, inicioPregunta + TRANS.veloFotogramas], [0, TRANS.veloFinal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const negro = interpolate(frame, [durationInFrames - TRANS.fundidoNegroFotogramas, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLOR.tinta }}>
      {planos.map((p, i) => {
        const esc = escenas[p.escena];
        const Comp = ESCENAS[esc.comp];
        return (
          <Sequence key={i} from={p.desde} durationInFrames={p.hasta - p.desde} name={`${esc.comp} · plano ${i + 1}`}>
            <CamaraPlano plano={p}>
              <PlanoEscena Comp={Comp} desfase={p.desde - esc.desde} dur={esc.hasta - esc.desde} marcas={esc.marcasF} datos={esc.datos} />
              {rotulos
                .filter((r) => r.escena === p.escena && (r.tipo === "etiqueta" || r.tipo === "llamada"))
                .map((r, k) => (
                  <RotuloEscena key={k} r={r} frame={frame} />
                ))}
            </CamaraPlano>
            {p.trans === "flash" && (
              <AbsoluteFill style={{ background: COLOR.flash, opacity: frame - p.desde < TRANS.flashFotogramas ? 1 : 0 }} />
            )}
          </Sequence>
        );
      })}

      {/* Oscurecer al 50 % con la pregunta final */}
      <AbsoluteFill style={{ background: "#000", opacity: velo }} />

      {rotulos
        .filter((r) => r.tipo === "cartel" || r.tipo === "insignia" || r.tipo === "pregunta")
        .map((r, k) => (
          <RotuloPantalla key={k} r={r} frame={frame} />
        ))}

      <Subtitulos bloques={bloques} ocultarDesdeMs={pregunta ? (resolver("e12", "que") / fps) * 1000 : undefined} />

      <AbsoluteFill style={{ background: "#000", opacity: negro }} />

      <Audio src={staticFile(voz)} />
      {conMusica && <Audio src={staticFile(MUSICA.src)} volume={MUSICA.vol} />}
      {sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={s.desde} name={`sfx ${s.src}`}>
          <Audio src={staticFile(s.src)} volume={s.vol ?? 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const PlanoEscena: React.FC<{
  Comp: React.FC<{ f: number; dur: number; m: Record<string, number>; datos?: Record<string, string | number> }>;
  desfase: number;
  dur: number;
  marcas: Record<string, number>;
  datos?: Record<string, string | number>;
}> = ({ Comp, desfase, dur, marcas, datos }) => {
  const frame = useCurrentFrame();
  return <Comp f={frame + desfase} dur={dur} m={marcas} datos={datos} />;
};

// La cámara necesita el fotograma relativo al plano (dentro de su <Sequence>)
const CamaraPlano: React.FC<React.PropsWithChildren<{ plano: PlanoResuelto }>> = ({ plano, children }) => {
  const frame = useCurrentFrame();
  return (
    <Camara plano={plano} frame={frame}>
      {children}
    </Camara>
  );
};
