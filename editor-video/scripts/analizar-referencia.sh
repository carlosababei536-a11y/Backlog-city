#!/usr/bin/env bash
# Extrae lo necesario para estudiar un vídeo de referencia.
# Uso: bash scripts/analizar-referencia.sh media/referencia.mp4
set -euo pipefail
REF="${1:-media/referencia.mp4}"
OUT=analisis
mkdir -p "$OUT/frames_2fps" "$OUT/frames_cortes"

# 2 fotogramas por segundo
ffmpeg -v error -y -i "$REF" -vf "fps=2,scale=540:-1" -q:v 3 "$OUT/frames_2fps/f_%03d.jpg"

# Un fotograma en cada cambio de plano + lista de tiempos
ffmpeg -v info -y -i "$REF" -vf "select='gt(scene,0.25)',showinfo,scale=540:-1" -vsync vfr -q:v 3 \
  "$OUT/frames_cortes/c_%03d.jpg" 2>&1 | grep -o "pts_time:[0-9.]*" | cut -d: -f2 > "$OUT/cortes_scene025.txt"

# Puntuación de cambio de plano (scdet) para afinar
ffmpeg -v info -i "$REF" -vf "scdet=threshold=8" -f null - 2>&1 \
  | grep -o "lavfi.scd.score: [0-9.]*, lavfi.scd.time: [0-9.]*" | awk '{print $4, $2}' | tr -d ',' > "$OUT/scdet.txt"

# Audio (mono 44,1 kHz) y loudness
ffmpeg -v error -y -i "$REF" -vn -ac 1 -ar 44100 "$OUT/referencia.wav"
ffmpeg -v info -i "$REF" -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary" > "$OUT/loudness.txt"

echo "Fotogramas: $(ls "$OUT/frames_2fps" | wc -l) a 2/s, $(ls "$OUT/frames_cortes" | wc -l) cambios de plano"
