# estilo.md — Guía de estilo (sacada de `referencia.mp4`)

Fuente: vídeo de TikTok de 45,07 s, 1080x1920, 30 fps, sobre Juliane Koepcke (1971).
Método: fotogramas a 2 por segundo (90) y en cada cambio de plano (38, con `scene>0.25`), detector `scdet`,
seguimiento de puntos con OpenCV (zoom y rotación de cada plano), lectura de píxeles (tamaños y colores),
espectrograma y medición EBU R128 del audio.
Las marcas **[SUPOSICIÓN]** señalan lo que no se puede medir del todo desde el archivo.

> Esta guía describe la *forma* del vídeo (ritmo, tipografía, animación, sonido). El contenido, los
> personajes y las ilustraciones de la referencia son de su autor: no se copian.

---

## 0. Formato

| Parámetro | Valor |
|---|---|
| Resolución | 1080 x 1920 (9:16) |
| Fotogramas por segundo | 30 (animación fluida, sin fotogramas repetidos: 1315 de 1351 son distintos) |
| Duración | 45,07 s |
| Códec de entrega | H.264 + AAC 44,1 kHz estéreo, unos 4 Mb/s |

## 1. Estructura narrativa (de qué va cada tramo)

| Tramo | Tiempo | % | Qué pasa |
|---|---|---|---|
| Gancho | 0,0–2,8 s | 6 % | El dato imposible en 3 bloques: «CAYÓ DESDE TRES / MIL METROS... / Y SOBREVIVIÓ.» |
| Contexto | 2,8–9,0 s | 14 % | Fecha (calendario), quién (nombre + edad), dónde (mapa), con quién |
| Incidente | 9,0–15,0 s | 13 % | Rayo, avión que se rompe, caída |
| Consecuencias | 15,0–19,4 s | 10 % | Heridas señaladas con etiquetas |
| Clave / lección | 19,4–26,2 s | 15 % | Recuerdo (flashback en tonos cálidos): el consejo del padre |
| Viaje | 26,2–33,1 s | 15 % | Mapa del río, contador de días, heridas |
| Rescate | 33,1–36,9 s | 8 % | Cabaña, trabajadores |
| Dato final | 36,9–39,2 s | 5 % | Infografía «1 DE 92» |
| Moraleja + pregunta | 39,2–45,1 s | 13 % | «NO SOBREVIVIÓ POR SUERTE...» y pregunta en pantalla «¿TÚ LO HABRÍAS SABIDO?» |

## 2. Ritmo de cortes

- **42 planos en 45 s**: duración media **1,07 s**, mediana **1,03 s**, mínimo 0,57 s (sin contar destellos ni desenfoques), máximo 2,93 s (el plano final).
- **Nunca más de 1,6 s seguidos con la misma imagen**, salvo 3 planos de «respiro»: el mapa animado (2,0 s), la infografía «1 DE 92» (2,33 s) y el plano final con la pregunta (2,93 s).
- El corte cae **en el inicio de una palabra o de un bloque de subtítulo**, nunca en mitad de una palabra.
- **Punch-ins** (corte al mismo dibujo, más cerca): 4 veces (1,27 s, 6,07 s, 21,87 s, 40,57 s). El salto de escala medido es de **x1,21 a x1,51 (media x1,4)**. Se usan para alargar una imagen sin que parezca quieta.
- Densidad: 1 imagen nueva por bloque de subtítulo (60 bloques ≈ 42 planos + 18 cambios de rótulo dentro del plano).

### Lista de planos de la referencia (plantilla de ritmo)

| # | Entra | Dura | Plano | Cámara | Rótulo en pantalla | Transición de entrada |
|---|---|---|---|---|---|---|
| 1 | 0,00 | 1,27 | Primer plano de cara asustada, lluvia | +2 % | — | — |
| 2 | 1,27 | 0,57 | Punch-in, más cerca | +4 % | — | corte |
| 3 | 1,83 | 1,00 | Plano detalle de ojo | **+59 % en 1 s** (zoom de impacto) | — | corte |
| 4 | 2,83 | 2,40 | Calendario «1971 · 24 · DICIEMBRE» | entra girado 14° y crece +73 %; a los 4,37 s salta +75 % | calendario | corte |
| 5 | 5,23 | 0,83 | Protagonista de cuerpo entero con foco circular | +3 % | etiqueta «NOMBRE · EDAD» | corte |
| 6 | 6,07 | 0,80 | Punch-in del mismo plano | +4 % | etiqueta | corte |
| 7 | 6,87 | 1,17 | Mapa del país, ruta roja que se dibuja | +3 % | nombres de ciudades | corte |
| 8 | 8,03 | 1,00 | Interior del avión | +5 % | — | corte |
| 9 | 9,20 | 0,63 | Avión en la tormenta | +9 % | — | **desenfoque** |
| 10 | 9,83 | 0,13 | **Destello blanco** (rayo) | — | — | flash 4 fotogramas |
| 11 | 9,97 | 1,07 | El rayo alcanza el avión | +9 % | — | corte |
| 12 | 11,03 | 0,60 | Cabina con restos volando | +5 %, gira −5° | — | corte |
| 13 | 11,63 | 1,00 | El avión se parte | +12 %, gira −16° | — | corte |
| 14 | 12,63 | 1,27 | Cenital de selva, asiento cayendo | +3 % (el asiento gira ~147°) | — | corte |
| 15 | 13,90 | 1,17 | Asiento cayendo, más cerca | +6 % | — | corte |
| 16 | 15,07 | 1,13 | En el suelo → de pie, rayos de luz | +4 % | — | corte |
| 17 | 16,20 | 1,03 | Plano medio | +3 % | etiqueta roja con línea | corte |
| 18 | 17,23 | 0,83 | Primer plano con herida | +4 % | etiqueta roja con línea | corte |
| 19 | 18,07 | 1,13 | Plano general junto al asiento | **−21 %** (se aleja) | — | corte |
| 20 | 19,37 | 1,47 | Primer plano, viñeta oscura | +1 % | — | **desenfoque** |
| 21 | 20,83 | 1,03 | Flashback: padre e hija (tonos naranjas) | +2 % | etiqueta «PADRE · BIÓLOGO» | corte |
| 22 | 21,87 | 1,40 | Punch-in al padre hablando | +2 % | — | corte |
| 23 | 23,27 | 0,83 | Vuelve el plano general | +3 % | cartel «BUSCA AGUA» | corte |
| 24 | 24,10 | 1,07 | Caminando por el arroyo | **−14 %** | cartel «SIGUE LA CORRIENTE» | corte |
| 25 | 25,17 | 1,00 | Dentro del agua, más cerca | −1 %, gira −6° | — | corte |
| 26 | 26,17 | 2,00 | Mapa cenital: arroyo → río → casas | −2 % | ARROYO / RÍO / PERSONAS | corte |
| 27 | 28,33 | 1,20 | Caminando bajo la lluvia | +3 % | insignia «DÍA 4» → «DÍA 7» | **desenfoque** |
| 28 | 29,53 | 1,03 | Detalle de pies en el barro | +2 % | — | corte |
| 29 | 30,57 | 1,43 | Detalle de herida en el brazo | +5 % | etiqueta roja con línea | corte |
| 30 | 32,00 | 1,13 | Calendario «DÍA 11» | entra girado 14° y crece +71 % | calendario | corte |
| 31 | 33,13 | 1,20 | Cabaña al atardecer | +7 % | — | corte |
| 32 | 34,33 | 0,57 | Protagonista sentada en la cabaña | +5 % | — | corte |
| 33 | 35,00 | 0,93 | Tres trabajadores en una barca | +4 % | — | **desenfoque** |
| 34 | 35,93 | 0,93 | Trabajadores sorprendidos, más cerca | +1 % | — | corte |
| 35 | 36,87 | 2,33 | Infografía oscura «1 DE 92» + 92 iconos | **−16 %** | número gigante | corte |
| 36 | 39,20 | 1,37 | Primer plano, media sonrisa, halo cálido | +2 % | — | corte |
| 37 | 40,57 | 1,57 | Punch-in del mismo plano | +1 % | — | corte |
| 38 | 42,13 | 2,93 | Mismo plano oscureciéndose | +25 % en 2,9 s | pregunta arriba | corte, y fundido a negro al final |

## 3. Subtítulos

| Parámetro | Valor medido |
|---|---|
| Fuente | **Montserrat Black (900)**, todo en MAYÚSCULAS **[SUPOSICIÓN: identificada a ojo; la forma de R, S, J y Ñ coincide]** |
| Tamaño | **63 px** de cuerpo (altura de mayúscula medida: 44 px) |
| Color normal | Blanco `#FFFFFF` |
| Color de la palabra destacada | Rojo coral **`#FE4B3F`** (medido 254,75,63) |
| Contorno | **4 px** alrededor, casi negro **`#17181A`** |
| Sombra | La misma tinta, desplazada **0 / +3 px** (el contorno inferior mide 6 px y el superior 3 px) |
| Separación entre palabras | ≈ **0,4 em** (25 px) |
| Posición vertical | Línea base en **y = 1311 px**; centro del texto en **y ≈ 1290 px (67 % de la altura)**. Fija durante todo el vídeo |
| Posición horizontal | Centrado en x = 540; ancho máximo visto 680 px (63 % del ancho) |
| Líneas | **Siempre 1 línea** |
| Palabras por bloque | **1 a 3** (media 2,2; 22 % de los bloques tienen 1 palabra) |
| Caracteres por bloque | **Máximo 18**, contando espacios y signos |
| Reglas de corte de bloque | 1) Se cierra después de una palabra con **coma, punto, puntos suspensivos o dos puntos** («JULIANE,» «ROTA,» «BIÓLOGO:» «AIRE.» van solos). 2) Si no hay signo, se cierra a las 3 palabras o al llegar a 18 caracteres. 3) **El número nunca se separa de su sustantivo** («10 DÍAS.», «92 PERSONAS.»). 4) Una pausa en la voz también cierra el bloque **[SUPOSICIÓN: explica «LLEVAN A / PERSONAS.»]** |
| Aparición | **Palabra a palabra**, en el instante en que se pronuncia (efecto karaoke que se va sumando: «UN» → «UN RAYO» → «UN RAYO ALCANZA») |
| Animación de cada palabra | Escala **0,7 → 1,0 en 5 fotogramas (167 ms)**, con aceleración suave al final y **sin rebote**. Aparece ya opaca (sin fundido). Solo se anima la palabra nueva; la línea se recentra a medida que crece |
| Cambio de bloque | **Corte seco**: el bloque anterior desaparece en el mismo fotograma en que entra la primera palabra del siguiente |
| Palabra destacada | **0 o 1 por bloque** (31 palabras rojas en 60 bloques, el 52 %). Se elige: la cifra o la fecha (1971, 17, 92), el sustantivo que es la noticia (MADRE, RAYO, CLAVÍCULA, OJO, AGUA, CORRIENTE, RÍOS, CABAÑA, COMIDA) o el verbo dramático (SOBREVIVIÓ, ROMPE, SUPO). Nunca artículos ni conectores. Se repite la misma palabra roja si vuelve a salir (SOBREVIVIÓ x3, RÍOS x2, MADRE x2) |
| Velocidad de lectura | Unas 3,1 palabras/s (≈ 187 palabras por minuto) |

## 4. Textos en pantalla (además del subtítulo)

Todos usan la misma fuente que los subtítulos (Montserrat Black **[SUPOSICIÓN]**) y la paleta crema + rojo + tinta.

| Elemento | Medidas | Estilo | Animación |
|---|---|---|---|
| **Etiqueta de nombre** «NOMBRE · EDAD» | 600 x 120 px en plano general (crece con el punch-in hasta 1048 x 211), y = 1516–1636 (79–85 %) | Fondo crema `#F3E8D2`, borde tinta 6 px, esquinas de 18 px; nombre en tinta y edad en rojo, separados por « · » | Aparece con salto de escala junto con la cámara **[SUPOSICIÓN: escala 0,7 → 1 como los subtítulos]** |
| **Etiqueta con línea** («CLAVÍCULA ROTA», «OJO HINCHADO», «HERIDA INFECTADA», «PADRE · BIÓLOGO») | Píldora de **490–640 x 86–96 px** | Fondo rojo `#FE4B3F`, texto blanco de unos 38 px, borde fino tinta. Una línea blanca de 3 px va a la zona del cuerpo y acaba en un punto rojo con aro blanco | La píldora salta (escala); la línea se dibuja hacia el punto **[SUPOSICIÓN]** |
| **Cartel de consejo** («BUSCA AGUA», «SIGUE LA CORRIENTE») | **858 x 342 px**, y = 469–811 (24–42 %) | Tarjeta crema, borde tinta 6 px, **girada unos −3°**, 2 líneas: primera en tinta y segunda en rojo, de unos 75 px | Entra con salto de escala y se queda mientras dura la frase |
| **Insignia de día** («DÍA 4» → «DÍA 7») | **502 x 175 px**, centrada, y = 229–404 (12–21 %) | Crema, borde tinta, esquinas de 16 px; «DÍA» en tinta y número en rojo, de unos 90 px | El número cambia como un contador |
| **Calendario** («1971 / 24 / DICIEMBRE», «DÍA / 11») | Ocupa el 40–75 % del ancho | Cabecera roja con anillas, cuerpo crema, número gigante en tinta y mes en rojo | Entra pequeño y **girado unos 14°**, crece **+70 % en ~1 s** y endereza |
| **Cifra gigante** («1 DE 92») | Altura de mayúscula **123 px** (cuerpo ≈ 175 px), y = 334–457 (17–24 %) | Rojo `#FE4B3F` sobre pizarra `#1C1F24`, debajo una cuadrícula de 92 iconos grises y uno naranja | La cámara se aleja −16 % en 2,3 s |
| **Pregunta final** («¿TÚ LO HABRÍAS / SABIDO?») | 2 líneas centradas; línea 1 en y = 291–376 (blanca), línea 2 en y = 395–452 (roja); cuerpo ≈ 80 px | Mismo contorno y sombra que los subtítulos | Aparece en 42,13 s y se queda hasta el final, también durante el oscurecimiento |
| Rótulos de mapa | De 30 a 60 px | Tinta o blanco con contorno | Se escriben a la vez que se dibuja la línea |

## 5. B-roll (imágenes)

- **100 % ilustración vectorial plana** (estilo «flat», personajes de cabeza grande, contorno tinta de 4–6 px). **Ninguna imagen real**.
- **Un único personaje protagonista** con el mismo diseño en todos los planos (pelo, ropa, manchas de suciedad que aumentan con la historia).
- Tipos de plano y cuántos hay: primer plano de cara (9), cuerpo entero o plano medio (12), plano detalle de objeto o herida (5), general o ambiente (8), mapa o infografía (5), calendario o tarjeta (3).
- Cada cifra o dato tiene su propio visual: fecha → calendario, edad → etiqueta, lugar → mapa, días → contador, estadística → cuadrícula de iconos.
- Elementos vivos dentro del plano: lluvia en diagonal casi constante, lágrimas o gotas, rayos de luz, niebla, partículas.

## 6. Transiciones

| Tipo | Cuántas | Valores |
|---|---|---|
| Corte seco | ~33 | El 85 % de los cambios |
| **Desenfoque** | 4 (9,03 s · 19,20 s · 28,17 s · 34,90 s) | **5 fotogramas** en total: 2 de desenfoque creciente en el plano que sale, 1 de desenfoque máximo (unos 40 px) y 2 de desenfoque decreciente en el que entra. Marca un **salto de tiempo o de lugar** (de la cabina a fuera, del presente al recuerdo, de un día a otro, de la espera al rescate) |
| **Destello blanco** | 1 (9,83 s) | **4 fotogramas** de imagen casi blanca (`#EEF1F6`, luminancia 212 frente a 55), justo en la palabra «RAYO» y con el sonido del trueno |
| Oscurecer + fundido a negro | 1 (final) | De 42,13 a 42,8 s la imagen baja al **50 % de brillo** (velo negro al 50 % en 0,6 s); se mantiene; en los **últimos 10 fotogramas (0,33 s)** funde a negro del todo |

## 7. Zooms y movimiento de cámara

- **Todo plano se mueve**: acercamiento lento de **+2 % a +5 % por plano** (1,5–5 % por segundo), en línea recta y a velocidad constante. Ningún plano está quieto.
- **Alejamiento** (−14 % a −21 % por plano) en 3 momentos de soledad o de escala: sola junto al asiento, caminando por el arroyo y la cuadrícula «1 DE 92».
- **Zoom de impacto**: +59 % en 1,0 s sobre el ojo en el gancho (plano 3).
- **Entrada de objeto con giro**: calendarios y tarjetas entran pequeños y girados unos 14°, y crecen +70 % en unos 1,1 s.
- **Giro de cámara** de −5° a −16° solo en los planos de caos (avión que se rompe).
- **Punch-in** (salto x1,2–1,5) para partir un mismo dibujo en 2 planos (véase §2).

## 8. Color

- Ilustración plana: **sin grano, sin degradados de grading**, sin desenfoque de fondo. Saturación media de 0,38 y brillo medio de 0,51 (paleta apagada y terrosa).
- La paleta cambia con cada tramo de la historia:

| Tramo | Colores dominantes |
|---|---|
| Selva y lluvia | `#2D3E36` (verde oscuro, el 18 % del vídeo), `#495F49`, `#798870` |
| Tormenta | `#1E2122` y azul pizarra `#2A2D36` |
| Recuerdo y rescate (cálidos) | `#E4A966` (naranja), `#EACA9C` (arena), `#AA8550` |
| Madera e interiores | `#493724`, `#796642` |
| Agua | `#81A1A2` |
| Tarjetas | Crema `#EDE6D6` / `#F3E8D2` |
| Acento (solo palabras destacadas y datos) | Rojo `#FE4B3F`, apenas el **1,1 %** de los píxeles |

- **Viñeta oscura** (bordes al 30–40 % de oscuridad **[SUPOSICIÓN]**) en los planos de recuerdo y reflexión (19,4–24,1 s).
- **Halo circular** claro detrás del personaje en los planos de presentación y en el final.

## 9. Sonido

| Capa | Valores |
|---|---|
| **Voz en off** | 1 narrador, en español. Banda cortada en ~11 kHz → **[SUPOSICIÓN: voz sintética (TTS) generada a 22 kHz]**. Unas 3,1 palabras/s. **Pausas entre frases de 0,25 a 0,45 s**; dentro de la frase, ≤ 0,15 s. Suena de principio a fin, sin huecos |
| **Música** | Base continua de 0 a 45 s (**ningún silencio** por debajo de −30 dB de más de 0,15 s). Notas tonales sostenidas (piano o pad) entre 150 y 1100 Hz que cambian cada 0,8–1,6 s. Tempo ≈ 75 BPM **[SUPOSICIÓN: estimado con la autocorrelación, poco fiable porque la voz tapa la música]**. Golpes graves en 0–1,2 s (gancho) |
| **Efectos (SFX)** | Trueno en **9,83 s**, sincronizado con el destello: chasquido de banda completa hasta 16 kHz + retumbo grave de 0,7 s. **Golpe o caída** en 11,9–12,3 s (barrido grave), cuando el avión se rompe. **Ambiente de lluvia y selva** de 15,0 a 31,9 s (ruido de banda ancha que empieza con un corte y acaba con otro corte). **Dron grave** (20–60 Hz) de **38,6 s al final**, que sube la tensión para la moraleja |
| Sonidos de los textos | No se detectan «pops» claros al aparecer las palabras **[SUPOSICIÓN: no llevan]** |
| **Loudness** | **−12,6 LUFS integrados**, rango de loudness (LRA) de **1,8 LU** (muy comprimido), RMS por segundo entre −17 y −12 dBFS |

## 10. Traducción directa a Remotion (valores para el código)

```ts
// Subtítulos
const SUB = {
  fontFamily: "Montserrat", fontWeight: 900, fontSize: 63, textTransform: "uppercase",
  color: "#FFFFFF", highlight: "#FE4B3F",
  stroke: "#17181A", strokeWidth: 4,      // usar paint-order: stroke fill, o 8 text-shadows
  shadow: "0px 3px 0px #17181A",
  centerY: 1290, maxWidth: 680, wordGap: "0.4em",
  maxWords: 3, maxChars: 18,
};
// Aparición de cada palabra: escala 0,7 → 1 en 5 fotogramas, sin rebote
const scale = interpolate(frame - wordStartFrame, [0, 5], [0.7, 1], {
  easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp",
});
// Movimiento de cámara por plano: acercamiento de +2 a +5 % lineal
const kenBurns = interpolate(frame, [0, durationInFrames], [1, 1.04]);
// Transición de desenfoque: 5 fotogramas, blur 0 → 40 px → 0
// Destello: 4 fotogramas de capa #EEF1F6 al 100 %
// Final: velo negro al 50 % en 18 fotogramas + fundido a negro en los 10 últimos
```

---

## Correcciones aprendidas

*(Aquí se añaden las correcciones que me hagas y que te gusten, con fecha. Mandan sobre todo lo anterior.)*
