// Edición de un vídeo grabado (mi-video.mp4) con estilo.md:
// vídeo ya sin silencios + subtítulos palabra a palabra + cortes con punch-in + fundido final.
import type { Caption } from "@remotion/captions";
import { getVideoMetadata } from "@remotion/media-utils";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { transformCamara } from "../componentes/Camara";
import { Pregunta } from "../componentes/Rotulos";
import { Subtitulos } from "../componentes/Subtitulos";
import { crearBloques } from "../estilo/bloques";
import { cargarFuentes } from "../estilo/fuentes";
import { COLOR, FPS, TRANS } from "../estilo/tokens";
import { crearPlanos, OPCIONES_POR_DEFECTO } from "./planos";

cargarFuentes();

export const miVideoSchema = z.object({
  video: z.string(), // ruta dentro de public/ (el vídeo ya recortado)
  palabras: z.string(), // ruta dentro de public/ (palabras con tiempos del vídeo recortado)
  foco: z.object({ x: z.number(), y: z.number() }), // dónde está la cara (para los punch-in)
  punch: z.number(),
  musica: z.string().optional(),
  volMusica: z.number().optional(),
  pregunta: z.object({ linea1: z.string(), linea2: z.string() }).optional(),
  datosPalabras: z.array(z.any()).optional(), // lo rellena calculateMetadata
});
type Props = z.infer<typeof miVideoSchema>;

export const calcularMiVideo: CalculateMetadataFunction<Props> = async ({ props }) => {
  const meta = await getVideoMetadata(staticFile(props.video));
  const res = await fetch(staticFile(props.palabras));
  const datosPalabras = (await res.json()) as Caption[];
  return {
    fps: FPS,
    durationInFrames: Math.max(1, Math.floor(meta.durationInSeconds * FPS)),
    props: { ...props, datosPalabras },
  };
};

export const MiVideo: React.FC<Props> = ({ video, foco, punch, musica, volMusica = 0.12, pregunta, datosPalabras = [] }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const bloques = useMemo(() => crearBloques(datosPalabras as Caption[], "auto"), [datosPalabras]);
  const planos = useMemo(
    () => crearPlanos(bloques, durationInFrames, fps, { ...OPCIONES_POR_DEFECTO, foco, punch }),
    [bloques, durationInFrames, fps, foco, punch],
  );
  const plano = planos.find((p) => frame >= p.desde && frame < p.hasta) ?? planos[planos.length - 1];
  const { estilo } = transformCamara(plano, frame - plano.desde);

  // Pregunta final (opcional): en los últimos 3 s, con la imagen al 50 % (estilo.md §4 y §6)
  const inicioPregunta = pregunta ? durationInFrames - 3 * fps : durationInFrames;
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
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill style={estilo}>
          <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: velo }} />
      {pregunta && <Pregunta f={frame} desde={inicioPregunta} linea1={pregunta.linea1} linea2={pregunta.linea2} />}
      <Subtitulos bloques={bloques} ocultarDesdeMs={pregunta ? (inicioPregunta / fps) * 1000 : undefined} />
      <AbsoluteFill style={{ background: "#000", opacity: negro }} />
      {musica && <Audio src={staticFile(musica)} volume={volMusica} />}
    </AbsoluteFill>
  );
};
