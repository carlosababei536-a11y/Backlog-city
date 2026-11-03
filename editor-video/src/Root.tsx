import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { duracionGuion5, Guion5, guion5Schema } from "./guion5/Guion5";
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
