// Sintetiza texto con espeak-ng y devuelve el WAV + el instante de inicio de cada palabra.
// Compilar: gcc -O2 -o espeak_palabras espeak_palabras.c -lespeak-ng
// Uso: ./espeak_palabras <voz> <velocidad> <tono> <entrada.txt> <salida.wav> > eventos.tsv
// Cada línea de salida: posicion_caracter(1-based) <TAB> longitud <TAB> ms
#include <espeak-ng/speak_lib.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

static short *buf = NULL; static size_t n = 0, cap = 0;

static int cb(short *wav, int num, espeak_EVENT *ev) {
  if (wav && num > 0) {
    if (n + num > cap) { cap = (n + num) * 2; buf = realloc(buf, cap * sizeof(short)); }
    memcpy(buf + n, wav, num * sizeof(short)); n += num;
  }
  for (; ev && ev->type != espeakEVENT_LIST_TERMINATED; ev++) {
    if (ev->type == espeakEVENT_WORD)
      printf("%d\t%d\t%d\n", ev->text_position, ev->length, ev->audio_position);
  }
  return 0;
}

static void w32(FILE *f, uint32_t v) { fwrite(&v, 4, 1, f); }
static void w16(FILE *f, uint16_t v) { fwrite(&v, 2, 1, f); }

int main(int argc, char **argv) {
  if (argc < 6) { fprintf(stderr, "uso: voz velocidad tono entrada.txt salida.wav\n"); return 1; }
  FILE *in = fopen(argv[4], "rb"); if (!in) { perror("entrada"); return 1; }
  fseek(in, 0, SEEK_END); long len = ftell(in); fseek(in, 0, SEEK_SET);
  char *text = calloc(len + 1, 1); fread(text, 1, len, in); fclose(in);
  int sr = espeak_Initialize(AUDIO_OUTPUT_SYNCHRONOUS, 0, NULL, 0);
  if (espeak_SetVoiceByName(argv[1]) != EE_OK) { fprintf(stderr, "voz no encontrada\n"); return 1; }
  espeak_SetParameter(espeakRATE, atoi(argv[2]), 0);
  espeak_SetParameter(espeakPITCH, atoi(argv[3]), 0);
  espeak_SetSynthCallback(cb);
  espeak_Synth(text, len + 1, 0, POS_CHARACTER, 0, espeakCHARS_UTF8, NULL, NULL);
  espeak_Synchronize();
  FILE *o = fopen(argv[5], "wb");
  uint32_t data = n * 2;
  fwrite("RIFF", 1, 4, o); w32(o, 36 + data); fwrite("WAVEfmt ", 1, 8, o);
  w32(o, 16); w16(o, 1); w16(o, 1); w32(o, sr); w32(o, sr * 2); w16(o, 2); w16(o, 16);
  fwrite("data", 1, 4, o); w32(o, data); fwrite(buf, 2, n, o); fclose(o);
  fprintf(stderr, "sample_rate=%d muestras=%zu duracion=%.2fs\n", sr, n, (double)n / sr);
  return 0;
}
