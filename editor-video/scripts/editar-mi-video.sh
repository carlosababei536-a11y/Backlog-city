#!/usr/bin/env bash
# Paso 3 completo con tu vídeo: Whisper (palabra a palabra) → corte de silencios > 0,3 s → edición con estilo.md → render + master.
# Uso: bash scripts/editar-mi-video.sh media/mi-video.mp4 [audio|palabras] [foco_x] [foco_y]
#   audio|palabras: cómo detectar silencios (palabras = mejor si hay ruido o música de fondo)
#   foco_x foco_y: dónde está tu cara en el vídeo, en px de 1080 x 1920 (para los punch-in)
# Variable opcional PALABRAS=ruta.json para saltarse Whisper (por ejemplo, si ya tienes la transcripción).
set -euo pipefail
ENTRADA="$1"; MODO="${2:-audio}"; FX="${3:-540}"; FY="${4:-760}"
NOMBRE=$(basename "${ENTRADA%.*}")
DIR="public/$NOMBRE"
mkdir -p "$DIR" out

if [ -z "${PALABRAS:-}" ]; then
  node scripts/transcribir.mjs "$ENTRADA" "$DIR"
  PALABRAS="$DIR/palabras.json"
fi
node scripts/cortar-silencios.mjs "$ENTRADA" "$PALABRAS" "$DIR/video-cortado.mp4" 0.3 0.12 -35 --modo="$MODO"

PROPS=$(printf '{"video":"%s/video-cortado.mp4","palabras":"%s/video-cortado.palabras.json","foco":{"x":%s,"y":%s},"punch":1.35}' "$NOMBRE" "$NOMBRE" "$FX" "$FY")
npx remotion render MiVideo "out/$NOMBRE-borrador-sin-master.mp4" --props="$PROPS" --codec=h264 --crf=18
bash scripts/masterizar.sh "out/$NOMBRE-borrador-sin-master.mp4" "out/$NOMBRE-borrador.mp4"
echo "Borrador: out/$NOMBRE-borrador.mp4"
