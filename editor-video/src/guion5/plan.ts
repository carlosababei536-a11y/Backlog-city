// Plan de montaje del Guion 5. Todo se ancla a palabras de la narración (el corte cae al empezar una palabra).
// Ancla: "palabra" (normalizada, sin tildes ni signos), "palabra#2" (2.ª aparición en la línea) o "^" (primera palabra).
import type { NombreEscena } from "./escenas";

export type Encuadre = { s: number; x: number; y: number; r?: number };

export type PlanoDef = {
  en: string;
  enc: Encuadre; // encuadre al empezar el plano
  fin?: Encuadre; // al terminar (por defecto: el mismo con +4 % de zoom)
  temblor?: number; // px de vibración (caos)
  trans?: "desenfoque" | "flash";
  sinPunch?: boolean; // no partir aunque dure más de 1,6 s
  punch?: Encuadre; // encuadre del punch-in automático si hay que partir el plano
};

export type RotuloDef =
  | { tipo: "cartel"; en: string; hasta?: string; linea1: string; linea2: string; x?: number; y?: number }
  | { tipo: "insignia"; en: string; hasta?: string; de: number; a: number; contar?: number }
  | { tipo: "etiqueta"; en: string; hasta?: string; nombre: string; dato: string; x: number; y: number }
  | { tipo: "llamada"; en: string; hasta?: string; texto: string; x: number; y: number; px: number; py: number }
  | { tipo: "pregunta"; en: string; linea1: string; linea2: string };

export type SfxDef = { src: string; en: string; vol?: number; desfaseMs?: number };

export type EscenaDef = {
  comp: NombreEscena;
  linea: string;
  planos: PlanoDef[];
  marcas?: Record<string, string>;
  datos?: Record<string, string | number>;
  rotulos?: RotuloDef[];
  sfx?: SfxDef[];
};

// Palabras en rojo (máx. 1 por bloque; ~50 % de los bloques), estilo.md §3
export const DESTACADAS: Record<string, string[]> = {
  e01: ["33", "700", "muertos"],
  e02: ["2010", "atacama", "chile"],
  e03: ["derrumba"],
  e04: ["emergencia", "comida", "dias", "33"],
  e05: ["urzua", "racionar", "cucharadas", "atun"],
  e06: ["familias", "esperanza"],
  e07: ["17", "senal", "perfora"],
  e08: ["nota", "bien", "33"],
  e09: ["reto", "excavar", "rescate", "700"],
  e10: ["capsula", "fenix"],
  e11: ["69", "luz", "33"],
  e12: ["sobrevivieron", "equipo", "nadie"],
};

export const PLAN: EscenaDef[] = [
  {
    comp: "Gancho",
    linea: "e01",
    planos: [
      { en: "^", enc: { s: 1, x: 540, y: 960 } },
      { en: "700", enc: { s: 1.45, x: 540, y: 940 } },
      // Zoom de impacto sobre los ojos (estilo.md §7: +59 % en 1 s)
      { en: "y", enc: { s: 2.3, x: 540, y: 1005 }, fin: { s: 3.3, x: 540, y: 1008 }, sinPunch: true },
    ],
    sfx: [
      { src: "guion5/sfx/golpe.wav", en: "^", vol: 0.45 },
      { src: "guion5/sfx/golpe.wav", en: "700", vol: 0.3 },
      { src: "guion5/sfx/golpe.wav", en: "y", vol: 0.4 },
    ],
  },
  {
    comp: "CalendarioEscena",
    linea: "e02",
    datos: { cabecera: "2010", numero: "5", mes: "AGOSTO" },
    planos: [{ en: "^", enc: { s: 1, x: 540, y: 900 }, punch: { s: 1.45, x: 540, y: 860 } }],
  },
  { comp: "MinaExterior", linea: "e02", planos: [{ en: "mina", enc: { s: 1, x: 540, y: 1150 }, fin: { s: 1.12, x: 540, y: 1230 } }] },
  {
    comp: "MapaChile",
    linea: "e02",
    marcas: { chile: "chile" },
    planos: [{ en: "desierto", enc: { s: 1, x: 560, y: 820 }, punch: { s: 1.3, x: 560, y: 600 } }],
  },
  {
    comp: "Derrumbe",
    linea: "e03",
    marcas: { derrumba: "derrumba" },
    planos: [
      { en: "^", enc: { s: 1, x: 540, y: 1150 } },
      { en: "derrumba", enc: { s: 1.15, x: 540, y: 1100, r: -6 }, fin: { s: 1.3, x: 540, y: 1080, r: -12 }, temblor: 18, trans: "flash" },
    ],
    sfx: [{ src: "guion5/sfx/derrumbe.wav", en: "derrumba", vol: 0.5 }],
  },
  {
    comp: "Refugio",
    linea: "e04",
    planos: [{ en: "^", enc: { s: 1, x: 500, y: 1150 }, fin: { s: 1.05, x: 600, y: 1150 }, punch: { s: 1.8, x: 520, y: 1120 } }],
  },
  {
    comp: "Comida",
    linea: "e04",
    planos: [{ en: "comida", enc: { s: 1, x: 540, y: 1000 } }],
    rotulos: [{ tipo: "cartel", en: "comida", linea1: "COMIDA PARA", linea2: "2-3 DÍAS", y: 470 }],
  },
  {
    comp: "Cuadricula",
    linea: "e04",
    datos: { cifra: "33", de: 0, a: 0 },
    planos: [{ en: "para#2", enc: { s: 1, x: 540, y: 960 }, fin: { s: 0.9, x: 540, y: 960 } }],
  },
  {
    comp: "Urzua",
    linea: "e05",
    planos: [
      { en: "^", enc: { s: 1.25, x: 540, y: 820 } },
      { en: "luis", enc: { s: 1, x: 540, y: 1000 } },
      { en: "toma", enc: { s: 1.6, x: 540, y: 840 } },
      { en: "racionar", enc: { s: 1.15, x: 540, y: 900 } },
    ],
    rotulos: [
      { tipo: "etiqueta", en: "luis", hasta: "toma", nombre: "LUIS URZÚA", dato: "JEFE", x: 540, y: 1660 },
      { tipo: "cartel", en: "racionar", linea1: "DECISIÓN:", linea2: "RACIONAR", y: 470 },
    ],
  },
  {
    comp: "Atun",
    linea: "e05",
    planos: [{ en: "dos#1", enc: { s: 1, x: 540, y: 1000 }, punch: { s: 1.3, x: 540, y: 1000 } }],
    rotulos: [{ tipo: "llamada", en: "cucharadas", texto: "2 CUCHARADAS · 48 H", x: 540, y: 400, px: 540, py: 760 }],
  },
  {
    comp: "Campamento",
    linea: "e06",
    planos: [
      { en: "^", enc: { s: 1.05, x: 440, y: 1350 }, fin: { s: 1.08, x: 640, y: 1350 }, trans: "desenfoque", punch: { s: 1.6, x: 540, y: 1520 } },
      { en: "lo", enc: { s: 1.1, x: 540, y: 1300 } },
    ],
    rotulos: [{ tipo: "cartel", en: "campamento", linea1: "CAMPAMENTO", linea2: "ESPERANZA", y: 470 }],
  },
  {
    comp: "RefugioCansado",
    linea: "e07",
    planos: [{ en: "^", enc: { s: 1.1, x: 540, y: 1150 }, trans: "desenfoque", punch: { s: 1.8, x: 700, y: 1100 } }],
    rotulos: [{ tipo: "insignia", en: "17", hasta: "hasta", de: 1, a: 17, contar: 24 }],
  },
  {
    comp: "Sonda",
    linea: "e07",
    marcas: { perfora: "perfora" },
    planos: [{ en: "hasta", enc: { s: 1, x: 540, y: 900 }, fin: { s: 1.08, x: 540, y: 880 }, punch: { s: 1.4, x: 540, y: 800 } }],
    sfx: [{ src: "guion5/sfx/taladro.wav", en: "sonda", vol: 0.3 }],
  },
  { comp: "SuperficieSonda", linea: "e08", planos: [{ en: "^", enc: { s: 1, x: 540, y: 1000 } }] },
  {
    comp: "Nota",
    linea: "e08",
    planos: [
      { en: "lleva", enc: { s: 1, x: 540, y: 900 } },
      { en: "estamos", enc: { s: 1.25, x: 540, y: 820 }, fin: { s: 1.32, x: 540, y: 820 }, punch: { s: 1.6, x: 540, y: 900 } },
    ],
  },
  { comp: "PerforadoraNoche", linea: "e09", planos: [{ en: "^", enc: { s: 1, x: 540, y: 1100 }, fin: { s: 1.05, x: 540, y: 820 } }] },
  {
    comp: "CorteTransversal",
    linea: "e09",
    marcas: { excavar: "excavar", roca: "roca" },
    planos: [
      { en: "habia", enc: { s: 1, x: 540, y: 960 } },
      { en: "rescate", enc: { s: 1.35, x: 600, y: 1100 } },
      { en: "700", enc: { s: 1.6, x: 700, y: 1480 }, sinPunch: true },
    ],
  },
  {
    comp: "Fenix",
    linea: "e10",
    marcas: { fenix: "fenix", subirlos: "subirlos" },
    planos: [
      { en: "^", enc: { s: 1, x: 540, y: 900 }, fin: { s: 1.05, x: 540, y: 900, r: 2 } },
      { en: "fenix", enc: { s: 1.3, x: 540, y: 780 } },
      { en: "subirlos", enc: { s: 1, x: 540, y: 1150 }, fin: { s: 1.05, x: 540, y: 1260 } },
    ],
  },
  {
    comp: "CalendarioEscena",
    linea: "e11",
    datos: { cabecera: "2010", numero: "13", mes: "OCTUBRE" },
    planos: [{ en: "^", enc: { s: 1, x: 540, y: 900 }, punch: { s: 1.45, x: 540, y: 860 } }],
  },
  {
    comp: "Salida",
    linea: "e11",
    planos: [
      { en: "69", enc: { s: 1, x: 540, y: 1000 } },
      { en: "el", enc: { s: 1.45, x: 600, y: 900 } },
    ],
    rotulos: [{ tipo: "insignia", en: "69", hasta: "el", de: 60, a: 69, contar: 14 }],
  },
  {
    comp: "Cuadricula",
    linea: "e11",
    datos: { cifra: "33 DE 33", de: 0, a: 33, tamano: 150 },
    planos: [{ en: "uno", enc: { s: 1, x: 540, y: 960 }, fin: { s: 0.9, x: 540, y: 960 }, sinPunch: true }],
  },
  {
    comp: "Equipo",
    linea: "e12",
    planos: [{ en: "^", enc: { s: 1, x: 540, y: 950 }, punch: { s: 1.5, x: 540, y: 930 } }],
  },
  {
    comp: "FinalCara",
    linea: "e12",
    planos: [
      { en: "nadie", enc: { s: 1, x: 540, y: 900 } },
      { en: "que", enc: { s: 1.3, x: 540, y: 880 }, fin: { s: 1.55, x: 540, y: 880 }, sinPunch: true },
    ],
    rotulos: [{ tipo: "pregunta", en: "que", linea1: "¿QUÉ HABRÍAS HECHO", linea2: "TÚ AHÍ ABAJO?" }],
  },
];

// Música de fondo continua (estilo.md §9)
export const MUSICA = { src: "guion5/musica.wav", vol: 0.12 }; // ~12 dB por debajo de la voz
// Segundos que se mantiene la imagen después de la última palabra (referencia: ~1,6 s)
export const COLA_FINAL_S = 1.6;
