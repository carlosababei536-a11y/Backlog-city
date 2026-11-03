#!/usr/bin/env bash
# Sustituye la voz provisional del Guion 5 por una voz real (grabada o de un servicio TTS) que lea narracion.json.
# Uso: bash scripts/voz-real.sh <audio.(wav|mp3|m4a)> [src/guion5/narracion.json] [public/guion5]
# Pasos: Whisper (tiempos por palabra) → alinear con el guion → cortar silencios > 0,3 s → regenerar la música a la nueva duración.
set -euo pipefail
AUDIO="$1"; NARR="${2:-src/guion5/narracion.json}"; DIR="${3:-public/guion5}"
mkdir -p "$DIR"
node scripts/transcribir.mjs "$AUDIO" "$DIR/whisper"
node scripts/alinear-guion.mjs "$DIR/whisper/palabras.json" "$NARR" "$DIR/palabras-brutas.json"
ffmpeg -y -v error -i "$AUDIO" -ac 1 -ar 44100 "$DIR/voz-bruta.wav"
node scripts/cortar-silencios.mjs "$DIR/voz-bruta.wav" "$DIR/palabras-brutas.json" "$DIR/voz.wav"
python3 scripts/generar-musica.py "$DIR/voz.palabras.json" "$DIR"
echo "Listo. Renderiza con: npm run guion5:render"
