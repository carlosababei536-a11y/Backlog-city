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
| `scripts/` (resto) | Voz provisional, transcripción, corte de silencios, música, capturas y masterizado |
| `analisis/` | Datos medidos de la referencia (tiempos de corte, loudness). Los fotogramas no se suben a git |
| `media/` | Vídeos fuente (`referencia.mp4`, `mi-video.mp4`). **No se sube a git** |
| `.claude/skills/` | Skills oficiales de Remotion (`npx skills add remotion-dev/skills`) |

## Borrador del Guion 5 (los 33 mineros)

Composición `Guion5` (`src/guion5/`): 21 escenas ilustradas en código, voz provisional sintetizada en local,
subtítulos palabra a palabra y música y efectos generados, todo según `estilo.md`.

```console
npm run guion5:voz      # voz provisional (espeak-ng) con el tiempo de cada palabra + corte de silencios > 0,3 s
npm run guion5:musica   # música de fondo y efectos sintetizados
npm run guion5:render   # render + masterizado a -13 LUFS -> out/guion5-borrador.mp4
```

- El texto está en `src/guion5/narracion.json` y el montaje (planos, rótulos, efectos, palabras en rojo) en `src/guion5/plan.ts`, anclado a palabras.
- La voz provisional necesita `espeak-ng` (`sudo apt install espeak-ng libespeak-ng-dev`). Es robótica a propósito: es solo para el ritmo.
- Para usar una voz real (grabada o de un servicio TTS), mira «Voz real para el Guion 5» más abajo.

## Con tu vídeo (`mi-video.mp4`): un solo comando

```console
npm run editar-mi-video -- media/mi-video.mp4            # → out/mi-video-borrador.mp4
npm run editar-mi-video -- media/mi-video.mp4 palabras   # si hay ruido o música de fondo
npm run editar-mi-video -- media/mi-video.mp4 audio 540 700   # indicando dónde está tu cara (x y)
```

Hace: Whisper con tiempos por palabra → corta silencios > 0,3 s (cortes ajustados a fotograma, sin desincronizar)
→ composición `MiVideo`: subtítulos palabra a palabra de estilo.md, palabras en rojo elegidas solas (~50 % de bloques),
un plano nuevo cada 0,9–1,6 s al empezar un bloque, alternando normal y punch-in x1,35, zoom lento +4 % → masterizado a −13 LUFS.

Probado con un vídeo sintético: 16,9 s → 13,1 s, 5 silencios cortados, la voz cae en el instante previsto tras cada corte.

## Voz real para el Guion 5

```console
npm run guion5:voz-real -- voz.mp3     # Whisper → alinear con narracion.json → cortar silencios → música nueva
npm run guion5:render
```

`scripts/alinear-guion.mjs` asigna cada palabra oída a su palabra y línea del guion (programación dinámica; los
números se comparan en letra). En la prueba con errores simulados: 175/175 líneas correctas, error de tiempo
mediano de 20 ms.

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
