"""Música de fondo y efectos PROVISIONALES sintetizados (sin descargas), según estilo.md §9.

Uso: python3 scripts/generar-musica.py public/guion5/voz.palabras.json public/guion5
Salida: musica.wav (base continua ~75 BPM) y sfx/golpe.wav, sfx/derrumbe.wav, sfx/taladro.wav
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(33)


def guardar(ruta: Path, x: np.ndarray):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    x = np.clip(x, -1, 1)
    est = np.stack([x, x], axis=1) if x.ndim == 1 else x
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((est * 32767).astype(np.int16).tobytes())


def paso_bajo(x, corte):
    a = np.exp(-2 * np.pi * corte / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def paso_bajo_rapido(x, corte):
    # filtro de un polo vectorizado por bloques (suficiente para ruido y pads)
    from scipy.signal import lfilter  # type: ignore

    a = np.exp(-2 * np.pi * corte / SR)
    return lfilter([1 - a], [1, -a], x)


def lp(x, corte):
    try:
        return paso_bajo_rapido(x, corte)
    except Exception:
        return paso_bajo(x, corte)


def hz(nota: str) -> float:
    nombres = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    n, o = nota[:-1], int(nota[-1])
    return 440.0 * 2 ** ((nombres[n] + 12 * (o - 4) - 9) / 12)


def envolvente(n, ataque, caida):
    e = np.ones(n)
    a = int(ataque * SR)
    c = int(caida * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if c:
        e[-c:] *= np.linspace(1, 0, c)
    return e


def pad(acorde, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for nota in acorde:
        f = hz(nota)
        for d in (-0.003, 0, 0.003):
            x += np.sin(2 * np.pi * f * (1 + d) * t + rng.random() * 6) * 0.18
            x += np.sin(2 * np.pi * 2 * f * (1 + d) * t) * 0.04
    return lp(x * envolvente(n, 0.5, 0.8), 1800) / len(acorde)


def pulsacion(f, dur=1.4, vol=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.exp(-t * 3.2)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * e
    return x * vol * envolvente(n, 0.004, 0.05)


def golpe(dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 75 * np.exp(-t * 2.2) + 32
    fase = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(fase) * np.exp(-t * 2.6)
    ruido = lp(rng.standard_normal(n), 900) * np.exp(-t * 22) * 0.6
    return (x + ruido) * 0.95


def derrumbe(dur=2.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    marron = np.cumsum(rng.standard_normal(n))
    marron = marron - lp(marron, 8)
    marron /= np.max(np.abs(marron)) + 1e-9
    env = np.minimum(1, t / 0.05) * np.exp(-t * 1.2)
    x = lp(marron, 400) * env * 1.6
    # impactos de rocas
    for k in range(14):
        ini = int((0.05 + rng.random() * 1.6) * SR)
        m = int(0.25 * SR)
        tt = np.arange(m) / SR
        trozo = lp(rng.standard_normal(m), 1200 + rng.random() * 1500) * np.exp(-tt * 18) * (0.4 + rng.random() * 0.5)
        x[ini : ini + m] += trozo[: len(x[ini : ini + m])]
    x += golpe(dur) * 0.9
    return x / (np.max(np.abs(x)) + 1e-9) * 0.95


def taladro(dur=2.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ruido = rng.standard_normal(n)
    banda = lp(ruido, 3000) - lp(ruido, 600)
    mod = 0.6 + 0.4 * np.sin(2 * np.pi * 28 * t)
    zumbido = np.sin(2 * np.pi * 110 * t) * 0.3 + np.sin(2 * np.pi * 220 * t) * 0.15
    x = (banda * mod * 0.8 + zumbido) * envolvente(n, 0.15, 0.4)
    return x / (np.max(np.abs(x)) + 1e-9) * 0.8


def main():
    palabras = json.load(open(sys.argv[1]))
    salida = Path(sys.argv[2])
    inicio = {}
    for p in palabras:
        inicio.setdefault(p["linea"], p["startMs"] / 1000)
    dur = (palabras[-1]["endMs"] + 450) / 1000 + 1.6
    n = int(dur * SR) + SR
    mus = np.zeros(n)

    def poner(x, seg, vol=1.0):
        i = int(seg * SR)
        if i >= n:
            return
        j = min(n, i + len(x))
        mus[i:j] += x[: j - i] * vol

    beat = 60 / 75  # 0,8 s
    t_historia = inicio["e02"]
    t_rescate = inicio["e11"]
    t_final = next(p["startMs"] / 1000 for p in palabras if p["linea"] == "e12" and p["text"].strip().lower().startswith("nadie"))

    # Gancho: dron grave y pulsos
    dron = np.sin(2 * np.pi * hz("A1") * np.arange(int(t_historia * SR)) / SR) * 0.35
    poner(dron * envolvente(len(dron), 0.3, 0.6), 0)

    # Historia (tensa): Am – F – Dm – E, un acorde cada 4 tiempos; pulsación de piano en cada tiempo
    tensa = [["A2", "C4", "E4", "A4"], ["F2", "C4", "F4", "A4"], ["D2", "D4", "F4", "A4"], ["E2", "B3", "E4", "G#4"]]
    brillante = [["C3", "E4", "G4", "C5"], ["G2", "D4", "G4", "B4"], ["A2", "C4", "E4", "A4"], ["F2", "C4", "F4", "A4"]]
    t = t_historia
    k = 0
    while t < t_final:
        prog = tensa if t < t_rescate else brillante
        ac = prog[k % 4]
        poner(pad(ac, beat * 4 + 0.8), t, 0.9)
        for b in range(4):
            nota = ac[1 + (b % 3)]
            poner(pulsacion(hz(nota) * (2 if t >= t_rescate else 1), vol=0.22), t + b * beat)
        poner(pulsacion(hz(ac[0]) / 2, dur=2.5, vol=0.35), t)
        t += beat * 4
        k += 1

    # Final: dron grave que sube la tensión hasta el final (20–60 Hz)
    m = n - int(t_final * SR)
    tt = np.arange(m) / SR
    final = (np.sin(2 * np.pi * 41.2 * tt) * 0.5 + np.sin(2 * np.pi * 55 * tt) * 0.25) * np.minimum(1, tt / 1.2)
    poner(final, t_final)
    poner(pad(["A2", "E3", "A3", "C4"], dur - t_final + 0.5), t_final, 0.7)

    # Fundido final de la música
    fin = int(dur * SR)
    caida = int(0.6 * SR)
    mus[fin - caida : fin] *= np.linspace(1, 0, caida)
    mus[fin:] = 0
    mus = mus[: fin + int(0.1 * SR)]
    mus /= np.max(np.abs(mus)) + 1e-9
    guardar(salida / "musica.wav", mus * 0.9)
    guardar(salida / "sfx" / "golpe.wav", golpe())
    guardar(salida / "sfx" / "derrumbe.wav", derrumbe())
    guardar(salida / "sfx" / "taladro.wav", taladro())
    print(f"musica.wav {dur:.2f}s · historia {t_historia:.2f}s · rescate {t_rescate:.2f}s · final {t_final:.2f}s")


if __name__ == "__main__":
    main()
