// Valores de estilo.md convertidos en constantes. Si cambias estilo.md, cambia esto.
export const FPS = 30;
export const ANCHO = 1080;
export const ALTO = 1920;

export const COLOR = {
  tinta: "#17181A",
  rojo: "#FE4B3F",
  blanco: "#FFFFFF",
  crema: "#F3E8D2",
  crema2: "#EDE6D6",
  pizarra: "#1C1F24",
  flash: "#EEF1F6",
  // Paleta del Guion 5 (mina: ocres y marrones; superficie: desierto claro)
  roca1: "#2A211A",
  roca2: "#3A2E24",
  roca3: "#4E3D2E",
  roca4: "#6B5440",
  polvo: "#C9A77C",
  ocre: "#D08A3E",
  arena: "#EACA9C",
  arena2: "#E4A966",
  cielo: "#8EC5D6",
  cielo2: "#BFE0E8",
  noche: "#1E2433",
  noche2: "#2A3245",
  piel: "#E3A979",
  piel2: "#C98A5C",
  piel3: "#A86F47",
  casco: "#F2B705",
  casco2: "#D99A00",
  mono: "#E8772E",
  mono2: "#C45F1E",
  reflectante: "#D7DCDF",
  luz: "#FFF1B8",
  verde: "#5E7D4E",
  azulChile: "#2B4FA0",
  rojoChile: "#D52B1E",
} as const;

export const FUENTE = "Montserrat";

// §3 Subtítulos
export const SUB = {
  tamano: 63,
  peso: 900,
  contorno: 4,
  sombraY: 3,
  centroY: 1290,
  anchoMax: 680,
  separacionEm: 0.4,
  maxPalabras: 3,
  maxCaracteres: 18,
  popFotogramas: 5,
  popEscalaInicial: 0.7,
} as const;

// §6 Transiciones
export const TRANS = {
  desenfoqueMax: 40, // px
  desenfoque: [16, 30, 40, 30, 16], // fotogramas -2..+2 alrededor del corte
  flashFotogramas: 4,
  veloFinal: 0.5,
  veloFotogramas: 18,
  fundidoNegroFotogramas: 10,
} as const;

// §2 y §7 Cámara
export const CAMARA = {
  acercamientoPorPlano: 0.04, // +2..+5 %
  punchIn: 1.4,
  planoMaxSegundos: 1.6,
} as const;
