import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { duracionGuion5, Guion5, guion5Schema } from "./guion5/Guion5";
import { calcularMiVideo, MiVideo, miVideoSchema } from "./mivideo/MiVideo";
import { ALTO, ANCHO, FPS } from "./estilo/tokens";

// Cada <Composition> es una entrada en la barra lateral de Remotion Studio.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Borrador del Guion 5 (los 33 mineros) con el estilo de estilo.md */}
      <Composition
        id="Guion5"
        component={Guion5}
        schema={guion5Schema}
        width={ANCHO}
        height={ALTO}
        fps={FPS}
        durationInFrames={duracionGuion5()}
        defaultProps={{ voz: "guion5/voz.wav", conMusica: true }}
      />
      {/* Tu vídeo grabado: scripts/editar-mi-video.sh media/mi-video.mp4 */}
      <Composition
        id="MiVideo"
        component={MiVideo}
        schema={miVideoSchema}
        calculateMetadata={calcularMiVideo}
        width={ANCHO}
        height={ALTO}
        fps={FPS}
        durationInFrames={1}
        defaultProps={{
          video: "mi-video/video-cortado.mp4",
          palabras: "mi-video/video-cortado.palabras.json",
          foco: { x: 540, y: 760 },
          punch: 1.35,
        }}
      />
      {/* Plantilla original: vídeo con subtítulos estilo TikTok */}
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
    </>
  );
};
