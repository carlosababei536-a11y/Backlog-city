import { continueRender, delayRender, staticFile } from "remotion";
import { FUENTE } from "./tokens";

let cargada = false;

export const cargarFuentes = () => {
  if (cargada) return;
  cargada = true;
  const handle = delayRender("Cargando Montserrat");
  const caras = [
    new FontFace(FUENTE, `url('${staticFile("fonts/montserrat-latin-900-normal.woff2")}') format('woff2')`, { weight: "900" }),
    new FontFace(FUENTE, `url('${staticFile("fonts/montserrat-latin-800-normal.woff2")}') format('woff2')`, { weight: "800" }),
    new FontFace("Mano", `url('${staticFile("fonts/permanent-marker-latin-400-normal.woff2")}') format('woff2')`, { weight: "400" }),
  ];
  Promise.all(caras.map((c) => c.load()))
    .then((cs) => {
      cs.forEach((c) => document.fonts.add(c));
      continueRender(handle);
    })
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
