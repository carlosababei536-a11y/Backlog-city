#!/usr/bin/env bash
# Normaliza el audio del render al loudness de la referencia (estilo.md §9: −12,6 LUFS → objetivo −13 LUFS, pico −1 dBTP)
# Uso: bash scripts/masterizar.sh out/entrada.mp4 out/salida.mp4
set -euo pipefail
IN="$1"; OUT="$2"; I="${3:--13}"
J=$(ffmpeg -hide_banner -nostats -i "$IN" -af loudnorm=I=$I:TP=-1:LRA=4:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'])")
mtp=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_tp'])")
mlra=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_lra'])")
mth=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_thresh'])")
off=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['target_offset'])")
ffmpeg -y -v error -i "$IN" -c:v copy \
  -af "loudnorm=I=$I:TP=-1:LRA=4:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,aresample=44100" \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "antes: $mi LUFS · después:"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
