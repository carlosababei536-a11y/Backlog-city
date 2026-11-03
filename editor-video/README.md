# Editor de vídeo con Remotion

Proyecto Remotion vertical **1080x1920 a 30 fps** (plantilla oficial TikTok de Remotion) para montar
vídeos cortos siguiendo la guía de estilo de [`estilo.md`](estilo.md).

## Qué hay aquí

| Ruta | Qué es |
|---|---|
| `estilo.md` | Guía de estilo con valores concretos, sacada de `referencia.mp4`. Las correcciones se añaden al final |
| `src/` | Composiciones de Remotion |
| `sub.mjs` + `whisper-config.mjs` | Transcripción con Whisper (whisper.cpp 1.7.5, modelo `medium`, español) con tiempos por palabra |
| `scripts/analizar-referencia.sh` | Extrae fotogramas (2/s + cambios de plano), audio y loudness de un vídeo de referencia |
| `analisis/` | Datos medidos de la referencia (tiempos de corte, loudness). Los fotogramas no se suben a git |
| `media/` | Vídeos fuente (`referencia.mp4`, `mi-video.mp4`). **No se sube a git** |
| `.claude/skills/` | Skills oficiales de Remotion (`npx skills add remotion-dev/skills`) |

## Comandos

```console
npm i                      # instalar dependencias
npm run dev                # abrir Remotion Studio
node sub.mjs public/mi-video.mp4   # transcribir con Whisper (palabra a palabra)
npx remotion render        # renderizar
```

La primera transcripción compila whisper.cpp y descarga el modelo `medium` (1,5 GB) desde
huggingface.co.

### En el entorno en la nube de Claude Code

- El navegador de Remotion no se puede descargar (remotion.media está bloqueado). Usa el que ya está instalado:
  `export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
- Para descargar el modelo de Whisper hace falta permitir `huggingface.co` en el acceso a red del entorno.

## Licencia

Remotion es gratis para personas y equipos de hasta 3 personas. Para algunas empresas hace falta licencia:
[términos](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
