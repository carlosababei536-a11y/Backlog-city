// Transcribe un vídeo o audio con Whisper (whisper.cpp) con tiempos por palabra.
// Uso: node scripts/transcribir.mjs media/mi-video.mp4 public/mi-video
// Salida: <carpeta>/palabras.json (formato Caption de @remotion/captions), listo para
//   node scripts/cortar-silencios.mjs media/mi-video.mp4 public/mi-video/palabras.json public/mi-video/mi-video-cortado.mp4
// La primera vez descarga el modelo desde huggingface.co (en este entorno hay que permitir ese dominio).
import { downloadWhisperModel, installWhisperCpp, toCaptions, transcribe } from "@remotion/install-whisper-cpp";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { WHISPER_LANG, WHISPER_MODEL, WHISPER_PATH, WHISPER_VERSION } from "../whisper-config.mjs";

const [, , entrada, salida = "public/transcripcion"] = process.argv;
if (!entrada) {
  console.error("uso: node scripts/transcribir.mjs <video-o-audio> [carpeta-salida]");
  process.exit(1);
}
mkdirSync(salida, { recursive: true });
const wav = path.join(salida, "audio-16k.wav");
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", entrada, "-ar", "16000", "-ac", "1", wav], { stdio: "inherit" });

await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
// Si una descarga anterior falló, queda un archivo vacío que bloquea la siguiente: se borra.
const modelo = path.join(WHISPER_PATH, `ggml-${WHISPER_MODEL}.bin`);
if (existsSync(modelo) && statSync(modelo).size === 0) rmSync(modelo);
await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });

const whisperCppOutput = await transcribe({
  inputPath: wav,
  model: WHISPER_MODEL,
  whisperPath: WHISPER_PATH,
  whisperCppVersion: WHISPER_VERSION,
  tokenLevelTimestamps: true,
  splitOnWord: true,
  language: WHISPER_LANG,
  printOutput: false,
});
const { captions } = toCaptions({ whisperCppOutput });
writeFileSync(path.join(salida, "palabras.json"), JSON.stringify(captions, null, 1));
console.log(`${captions.length} palabras -> ${path.join(salida, "palabras.json")}`);
