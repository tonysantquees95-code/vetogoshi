"use strict";
/* ===== Som do Bichix: tudo sintetizado na hora (sem arquivos). Cada espécie tem a sua voz. ===== */
const Som = (() => {
  let ac = null, mestre = null, ligado = true, musica = false, timer = 0, prox = 0, passo = 0;
  const garantir = () => {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); mestre = ac.createGain(); mestre.gain.value = 0.55; mestre.connect(ac.destination); } catch (e) { ac = null; } }
    if (ac && ac.state === "suspended") ac.resume();
    return ac;
  };
  function nota(f1, dur, tipo = "sine", vol = 0.2, f2 = null, atraso = 0) {
    if (!ligado || !garantir()) return;
    const t = ac.currentTime + atraso, o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f1, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(mestre); o.start(t); o.stop(t + dur + 0.05);
  }
  function ruido(dur, vol = 0.1, freq = 3000, atraso = 0, tipo = "highpass") {
    if (!ligado || !garantir()) return;
    const t = ac.currentTime + atraso, n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n * 0.2);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = buf; f.type = tipo; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(mestre); s.start(t);
  }
  /* voz de cada bichinho: m = tom (1 = feliz, <1 = triste) */
  const VOZES = {
    gato: (m) => { nota(620 * m, 0.16, "triangle", 0.22, 880 * m); nota(880 * m, 0.28, "triangle", 0.2, 520 * m, 0.14); },
    cao: (m) => { nota(260 * m, 0.1, "square", 0.14, 190 * m); nota(300 * m, 0.12, "square", 0.14, 200 * m, 0.16); },
    coelho: (m) => { nota(1500 * m, 0.07, "sine", 0.2, 2000 * m); nota(1700 * m, 0.09, "sine", 0.2, 2300 * m, 0.1); },
    dino: (m) => { nota(150 * m, 0.45, "sawtooth", 0.13, 70 * m); nota(110 * m, 0.4, "square", 0.08, 60 * m, 0.05); },
    pinto: (m) => { for (let i = 0; i < 3; i++) nota((1900 + i * 200) * m, 0.05, "square", 0.1, (2300 + i * 150) * m, i * 0.09); },
    urso: (m) => { nota(130 * m, 0.4, "sawtooth", 0.12, 90 * m); nota(170 * m, 0.25, "square", 0.06, 100 * m, 0.1); },
    panda: (m) => { nota(330 * m, 0.18, "sine", 0.2, 260 * m); nota(300 * m, 0.22, "sine", 0.2, 220 * m, 0.2); },
    leao: (m) => { nota(110 * m, 0.7, "sawtooth", 0.15, 55 * m); nota(80 * m, 0.7, "square", 0.08, 50 * m, 0.05); },
    tigre: (m) => { nota(160 * m, 0.4, "sawtooth", 0.13, 100 * m); nota(220 * m, 0.3, "triangle", 0.12, 120 * m, 0.1); },
    vaca: (m) => { nota(180 * m, 0.7, "sawtooth", 0.11, 140 * m); nota(160 * m, 0.7, "triangle", 0.1, 120 * m, 0.05); },
    cervo: (m) => { nota(900 * m, 0.25, "sine", 0.18, 1300 * m); nota(1300 * m, 0.3, "sine", 0.16, 800 * m, 0.22); },
    porquinho: (m) => { nota(320 * m, 0.12, "square", 0.12, 200 * m); nota(300 * m, 0.14, "square", 0.12, 180 * m, 0.17); },
    rato: (m) => { for (let i = 0; i < 3; i++) nota(2200 * m, 0.04, "sine", 0.14, 2800 * m, i * 0.07); },
    elefante: (m) => { nota(300 * m, 0.1, "sawtooth", 0.12, 500 * m); nota(500 * m, 0.45, "sawtooth", 0.14, 800 * m, 0.1); nota(800 * m, 0.3, "sawtooth", 0.1, 300 * m, 0.5); },
    macaco: (m) => { for (let i = 0; i < 3; i++) nota(500 * m, 0.1, "sine", 0.2, 750 * m, i * 0.14); },
    sapo: (m) => { nota(170 * m, 0.08, "square", 0.12, 150 * m); nota(190 * m, 0.1, "square", 0.12, 130 * m, 0.1); },
    galo: (m) => { nota(700 * m, 0.1, "sine", 0.2, 1400 * m); nota(1400 * m, 0.22, "sine", 0.2, 900 * m, 0.12); nota(900 * m, 0.25, "sine", 0.18, 1300 * m, 0.35); },
    pinguim: (m) => { nota(500 * m, 0.18, "square", 0.1, 400 * m); nota(520 * m, 0.2, "square", 0.1, 380 * m, 0.22); },
    gosma: (m) => { nota(280 * m, 0.14, "sine", 0.28, 620 * m); nota(520 * m, 0.2, "sine", 0.24, 240 * m, 0.15); },
  };
  const EFEITOS = {
    toque: () => nota(700, 0.05, "square", 0.07, 900),
    comer: () => { for (let i = 0; i < 3; i++) { nota(330 - i * 30, 0.07, "triangle", 0.2, 200, i * 0.14); ruido(0.04, 0.05, 1500, i * 0.14); } },
    banho: () => { ruido(2.6, 0.07, 2400); nota(900, 0.5, "sine", 0.03, 1200); },
    ping: () => { nota(988, 0.09, "triangle", 0.2); nota(1319, 0.16, "triangle", 0.2, null, 0.08); },
    erro: () => nota(180, 0.25, "sawtooth", 0.12, 90),
    pulo: () => nota(400, 0.18, "sine", 0.18, 900),
    vitoria: () => [523, 659, 784, 1047].forEach((f, i) => nota(f, 0.18, "triangle", 0.2, null, i * 0.11)),
    trinca: () => { ruido(0.08, 0.14, 1800); nota(220, 0.1, "square", 0.1, 120); },
    chocar: () => { ruido(0.2, 0.2, 1200); [392, 523, 659, 784, 1047].forEach((f, i) => nota(f, 0.2, "triangle", 0.22, null, 0.12 + i * 0.1)); },
    dormir: () => [523, 440, 349].forEach((f, i) => nota(f, 0.3, "sine", 0.12, null, i * 0.22)),
    remedio: () => { nota(600, 0.1, "sine", 0.15, 900); nota(900, 0.15, "sine", 0.15, 1200, 0.1); },
    triste: () => [392, 330, 262, 196].forEach((f, i) => nota(f, 0.4, "triangle", 0.2, null, i * 0.35)),
    bola: () => nota(500, 0.12, "sine", 0.18, 250),
    cesta: () => { ruido(0.15, 0.1, 2500); EFEITOS.ping(); },
  };
  /* músiquinha de fundo: melodia em pentatônica, baixo e um "tique" leve */
  const ESCALA = [262, 294, 330, 392, 440, 523, 588, 659];
  const MEL = [[0, -1, 2, -1, 4, -1, 2, -1, 3, -1, 2, -1, 1, -1, 0, -1], [4, -1, 5, -1, 4, -1, 2, -1, 3, -1, 1, -1, 2, -1, -1, -1], [2, -1, 4, -1, 5, -1, 7, -1, 5, -1, 4, -1, 2, -1, 0, -1], [3, -1, 2, -1, 1, -1, 2, -1, 0, -1, -1, -1, 1, -1, -1, -1]];
  const BAIXO = [0, 0, 3, 4]; const PASSO = 0.26;
  function agendar() {
    if (!ac || !musica || !ligado) return;
    while (prox < ac.currentTime + 0.35) {
      const compasso = Math.floor(passo / 16) % MEL.length, i = passo % 16, n = MEL[compasso][i];
      const atraso = Math.max(0, prox - ac.currentTime);
      if (n >= 0) nota(ESCALA[n], PASSO * 1.6, "triangle", 0.055, null, atraso);
      if (i % 8 === 0) nota(ESCALA[BAIXO[compasso]] / 2, PASSO * 6, "sine", 0.07, null, atraso);
      if (i % 4 === 2) ruido(0.03, 0.012, 6000, atraso);
      prox += PASSO; passo++;
    }
  }
  return {
    ligado: () => ligado,
    definir(v) { ligado = v; if (!v) this.parar(); else if (musica) this.musica(true); },
    desbloquear() { garantir(); },
    voz(especie, m = 1) { (VOZES[especie] || VOZES.gato)(m); },
    efeito(n) { if (EFEITOS[n]) EFEITOS[n](); },
    musica(v) {
      musica = v; clearInterval(timer);
      if (v && ligado && garantir()) { prox = ac.currentTime + 0.1; timer = setInterval(agendar, 120); }
    },
    parar() { clearInterval(timer); },
    pausar(p) { if (!ac) return; if (p) { ac.suspend(); } else if (ligado) ac.resume(); },
  };
})();
