"use strict";
/* ===== Brincadeiras do Bichix: tudo visual, um toque por vez ===== */
let jogoAtivo = null;
const AJ = 272;                                       // altura (lógica) dos jogos em tela alta; largura é sempre 192
function pararJogo() { if (jogoAtivo) { jogoAtivo.rodando = false; if (jogoAtivo.limpar) jogoAtivo.limpar(); jogoAtivo = null; } }

function abrirJogos() {
  const nomes = Object.entries(NOMES).map(([i, n]) => [i, n === "Buscar a bolinha" ? "Buscar" : n === "Pegar estrelas" ? "Estrelas" : n]);
  folha("Brincar", `<div class="jogos">${nomes.map(([i, n]) => `<button class="cartao foto" data-j="${i}" aria-label="${n}"><canvas width="384" height="384" data-m="${i}"></canvas><span class="nome">${n}</span></button>`).join("")}</div>`,
    (el) => {
      el.querySelectorAll("canvas[data-m]").forEach((c) => miniatura(c, c.dataset.m));
      el.querySelectorAll("[data-j]").forEach((x) => x.addEventListener("click", () => { Som.desbloquear(); rodar(x.dataset.j); }));
    });
}
/* a "foto" de cada brincadeira: o bichinho jogando, desenhado com a própria cena do jogo */
function miniatura(cv, nome) {
  const alvo = cv.getContext("2d"), alto = ALTOS.includes(nome), tmp = alto ? document.createElement("canvas") : null; if (tmp) { tmp.width = 384; tmp.height = 2 * AJ; }
  const ctx = tmp ? tmp.getContext("2d") : alvo, b = estado.bicho, jg = JOGOS[nome], s = jg.iniciar(b); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = false; RESOL = 2; s.k = { esq: 0, dir: 0, cima: 0, baixo: 0 };
  if (nome === "basquete") { s.hx = 124; s.bola = { t: 0.3, tx: 124, dur: 0.62 }; s.res = [1, 1, 0, 0, 0]; }
  if (nome === "buscar") { s.fase = "volta"; s.bx = 120; s.by = 160; s.dirv = -1; s.bola = { x: 120, y: 108 }; s.res = [1, 1, 1, 0, 0]; s.t = 0.1; }
  if (nome === "estrelas") { s.x = 96; s.pegas = 6; s.itens = [{ x: 50, y: 40, t: "e" }, { x: 140, y: 70, t: "e" }, { x: 100, y: 110, t: "e" }, { x: 160, y: 30, t: "p" }]; }
  if (nome === "pulapula") { s.x = 300; s.y = 130; s.vy = -60; s.moedas = 3; s.t = 0.4; s.hint = 0; }
  if (nome === "conserta") { s.t = 0.4; s.hint = 0; s.pos = { x: s.cx(1), y: s.cy(2) }; s.tijolos = [{ x: s.cx(2), y: 70 }]; }
  if (nome === "cobrinha") { s.corpo = [{ x: 7, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 7 }]; s.maca = { x: 9, y: 8 }; s.comidas = 3; }
  if (nome === "tijolos") { s.quebrados = 6; s.tij = s.tij.map((v, i) => (i % 9 === 4 ? 0 : v)); s.preso = false; s.bola = { x: 110, y: 120, vx: 0, vy: 0 }; s.px = 100; }
  if (nome === "toupeiras") { [1, 4, 8].forEach((i, n) => { s.bur[i] = { t: 0.4, tipo: n === 2 ? "b" : "m", vida: 2, hit: 0 }; }); s.acertos = 5; }
  if (nome === "memoria") { [0, 3, 6, 9].forEach((i, n) => { s.cartas[i].v = true; s.cartas[i].f = 1; s.cartas[i].ok = n < 2; }); s.pares = 1; }
  if (nome === "voa") { s.ligou = true; s.y = 84; s.vy = -40; s.canos = [{ x: 118, gy: 96, p: false }, { x: 190, gy: 70, p: false }]; s.pontos = 4; }
  jg.desenhar(s, ctx, b);
  if (tmp) alvo.drawImage(tmp, 0, Math.round((2 * AJ - 384) * (nome === "tijolos" ? 0.15 : nome === "voa" || nome === "pulapula" ? 0.8 : 0.5)), 384, 384, 0, 0, 384, 384);
}
const NOMES = { basquete: "Basquete", buscar: "Buscar a bolinha", estrelas: "Pegar estrelas", pulapula: "Pulapula", conserta: "Conserta-tudo", cobrinha: "Cobrinha", tijolos: "Quebra-tijolos", toupeiras: "Toupeiras", memoria: "Memória", voa: "Voa-voa" };
const ALTOS = ["pulapula", "cobrinha", "tijolos", "toupeiras", "memoria", "voa"];
const JOGOS = { basquete: jogoBasquete(), buscar: jogoBuscar(), estrelas: jogoEstrelas(), pulapula: jogoPulapula(), conserta: jogoConserta(), cobrinha: jogoCobrinha(), tijolos: jogoTijolos(), toupeiras: jogoToupeiras(), memoria: jogoMemoria(), voa: jogoVoa() };

const TECLAS = { ArrowLeft: "esq", ArrowRight: "dir", ArrowUp: "cima", ArrowDown: "baixo", a: "esq", d: "dir", w: "cima", s: "baixo", " ": "acao", Enter: "acao", z: "acao", x: "acao" };
function rodar(nome) {
  const jogo = JOGOS[nome], b = estado.bicho, ctl = jogo.ctl || {}, HJ = ALTOS.includes(nome) ? AJ : 192;
  $("#folhaTitulo").textContent = NOMES[nome];
  $("#folha").classList.add("cheio");
  const dirs = ctl.dirs || [], quatro = dirs.includes("cima");
  const bt = (k, ic, cls = "") => `<button class="ctl ${cls}" data-k="${k}" aria-label="${k}">${icone(ic)}</button>`;
  const pad = !dirs.length ? "<span></span>" : quatro ? `<div class="dpad quatro">${bt("cima", "setacima", "up")}${bt("esq", "setaesq", "left")}${bt("dir", "setadir", "right")}${bt("baixo", "setabaixo", "down")}</div>` : `<div class="dpad">${bt("esq", "setaesq")}${bt("dir", "setadir")}</div>`;
  const acao = ctl.acao ? bt("acao", ctl.acao, "grande") : "<span></span>";
  $("#folhaCorpo").innerHTML = `<div class="jogo-wrap"><canvas id="cvJogo" width="384" height="${2 * HJ}" aria-label="Brincadeira"></canvas>${dirs.length || ctl.acao ? `<div class="controles">${pad}${acao}</div>` : ""}</div>`;
  const cv = $("#cvJogo"), ctx = cv.getContext("2d"); cv.style.width = `min(100%, 720px, calc((100dvh - ${ctl.dirs || ctl.acao ? 230 : 130}px) * ${192 / HJ}))`; cv.style.aspectRatio = `192 / ${HJ}`;
  const s = jogo.iniciar(b), est = { rodando: true }; jogoAtivo = est; s.k = { esq: 0, dir: 0, cima: 0, baixo: 0 };
  const aperta = (k, on) => { s.k[k] = on ? 1 : 0; if (on && jogo.tecla && !s.fim) jogo.tecla(s, k); };
  document.querySelectorAll("#cvJogo + .controles .ctl").forEach((el) => {
    const k = el.dataset.k;
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {} el.classList.add("on"); Som.desbloquear(); aperta(k, true); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => el.addEventListener(ev, () => { el.classList.remove("on"); aperta(k, false); }));
    el.addEventListener("contextmenu", (e) => e.preventDefault());
  });
  const kd = (e) => { const k = TECLAS[e.key] || TECLAS[(e.key || "").toLowerCase()]; if (!k || e.repeat) return; e.preventDefault(); aperta(k, true); }, ku = (e) => { const k = TECLAS[e.key] || TECLAS[(e.key || "").toLowerCase()]; if (k) aperta(k, false); };
  window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); est.limpar = () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) * 192) / r.width, ((e.clientY - r.top) * HJ) / r.height]; };
  cv.addEventListener("pointerdown", (e) => { const [x, y] = pos(e); if (jogo.toque) jogo.toque(s, x, y); });
  if (jogo.mover) cv.addEventListener("pointermove", (e) => { if (e.buttons || e.pointerType === "touch") jogo.mover(s, ...pos(e)); });
  let ult = performance.now();
  const laco = (agora) => {
    if (!est.rodando) return;
    const dt = Math.min(0.05, (agora - ult) / 1000); ult = agora;
    jogo.passo(s, dt); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = false; RESOL = 2; jogo.desenhar(s, ctx, b);
    if (s.fim) { est.rodando = false; if (est.limpar) est.limpar(); setTimeout(() => { if (jogoAtivo === null || jogoAtivo === est) resultado(nome, s.frac); }, 900); return; }
    requestAnimationFrame(laco);
  };
  requestAnimationFrame(laco);
}


function resultado(nome, frac) {
  const b = estado.bicho; if (!b) return;
  const estrelas = frac >= 0.75 ? 3 : frac >= 0.4 ? 2 : 1;
  b.tedio = lim(b.tedio + 12 + frac * 28); b.energia = lim(b.energia - 8); b.fome = lim(b.fome - 5); b.cuidado = lim(b.cuidado + 2);
  const ganho = estrelas * 3 + (estrelas === 3 ? 2 : 0); estado.moedas = (estado.moedas || 0) + ganho; estado.estrelas = (estado.estrelas || 0) + estrelas;
  gravar(); atualizar(); aviso(`+${ganho} moedas`);
  Som.efeito(estrelas >= 2 ? "vitoria" : "ping"); setTimeout(() => Som.voz(b.especie), 600); pulo = 14; corações(6, 96, 110);
  const star = (on) => `<svg viewBox="0 0 24 24" class="${on ? "estrela-on" : "estrela-off"}" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>`;
  const msg = estrelas === 3 ? "Parabéns!" : estrelas === 2 ? "Muito bem!" : "Boa tentativa!", sub = estrelas === 3 ? "Você foi incrível!" : estrelas === 2 ? "Quase perfeito!" : "Tente de novo e ganhe mais estrelas.";
  $("#folha").classList.remove("cheio"); $("#folhaTitulo").textContent = "Fim de jogo";
  $("#folhaCorpo").innerHTML = `<div class="resultado"><canvas id="confete" aria-hidden="true"></canvas><div class="faixa"><h3 class="parabens">${msg}</h3><p class="sub">${sub}</p></div><div class="estrelas-res" aria-label="${estrelas} de 3 estrelas">${[1, 2, 3].map((i) => `<span class="est-wrap" style="animation-delay:${0.15 + i * 0.22}s">${star(i <= estrelas)}</span>`).join("")}</div><div class="ganho"><i class="moeda"></i><strong>+${ganho}</strong> moedas</div><div class="res-botoes"><button class="btn-res primario" id="rejogar">${icone("repetir")}<span>Jogar de novo</span></button><button class="btn-res" id="outro">${icone("controle")}<span>Outros jogos</span></button></div></div>`;
  if (estrelas >= 2) confete($("#confete"), estrelas === 3 ? 90 : 50);
  $("#rejogar").addEventListener("click", () => { if (estado.bicho.energia < 10) { fechar(); return aviso("Ele está cansado."); } rodar(nome); });
  $("#outro").addEventListener("click", abrirJogos);
}

/* ---------- 6) Cobrinha: setas para virar, pegue as maçãs sem bater ---------- */
function jogoCobrinha() {
  const N = 12, NY = 17, C = 16;
  const nova = (s) => { do { s.maca = { x: (Math.random() * N) | 0, y: (Math.random() * NY) | 0 }; } while (s.corpo.some((c) => c.x === s.maca.x && c.y === s.maca.y)); };
  return {
    ctl: { dirs: ["esq", "dir", "cima", "baixo"] },
    tecla(s, k) { const d = { esq: [-1, 0], dir: [1, 0], cima: [0, -1], baixo: [0, 1] }[k]; if (!d || s.fim) return; const at = s.fila.length ? s.fila[s.fila.length - 1] : s.d; if ((d[0] === -at[0] && d[1] === -at[1]) || (d[0] === at[0] && d[1] === at[1])) return; if (s.fila.length < 2) s.fila.push(d); },
    iniciar() { const s = { corpo: [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }], d: [1, 0], fila: [], acc: 0, vel: 0.26, comidas: 0, t: 0, fim: false, frac: 0, fx: [] }; nova(s); return s; },
    passo(s, dt) {
      s.t += dt; s.acc += dt; s.fx.forEach((f) => (f.t += dt)); s.fx = s.fx.filter((f) => f.t < 0.6);
      while (s.acc >= s.vel && !s.fim) {
        s.acc -= s.vel; if (s.fila.length) s.d = s.fila.shift();
        const h = s.corpo[0], n = { x: h.x + s.d[0], y: h.y + s.d[1] };
        if (n.x < 0 || n.y < 0 || n.x >= N || n.y >= NY || s.corpo.slice(0, -1).some((c) => c.x === n.x && c.y === n.y)) { s.fim = true; s.frac = Math.max(0.1, Math.min(1, s.comidas / 12)); Som.efeito("erro"); break; }
        s.corpo.unshift(n);
        if (n.x === s.maca.x && n.y === s.maca.y) { s.comidas++; s.vel = Math.max(0.12, s.vel - 0.009); Som.efeito("ping"); s.fx.push({ x: n.x * C + 8, y: n.y * C + 8, t: 0 }); nova(s); if (s.comidas >= 12) { s.fim = true; s.frac = 1; Som.efeito("vitoria"); } } else s.corpo.pop();
      }
    },
    desenhar(s, ctx, b) {
      for (let y = 0; y < NY; y++) for (let x = 0; x < N; x++) { ctx.fillStyle = (x + y) % 2 ? "#4ade80" : "#3cc96f"; ctx.fillRect(x * C, y * C, C, C); }
      ctx.fillStyle = "#00000022"; ctx.fillRect(0, 0, 192, 2); ctx.fillRect(0, AJ - 2, 192, 2); ctx.fillRect(0, 0, 2, AJ); ctx.fillRect(190, 0, 2, AJ);
      const m = s.maca, mx = m.x * C + 8, my = m.y * C + 8 + Math.sin(s.t * 6) * 1;
      ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.ellipse(mx, my + 7, 6, 2, 0, 0, 7); ctx.fill(); esfera(ctx, mx, my + 1, 6.5, "#ef4444", "#7f1d1d"); ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.ellipse(mx + 3, my - 6, 3.5, 1.8, -0.6, 0, 7); ctx.fill(); ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx, my - 4); ctx.lineTo(mx + 1, my - 8); ctx.stroke();
      for (let i = s.corpo.length - 1; i >= 1; i--) { const c = s.corpo[i], x = c.x * C + 8, y = c.y * C + 8, r = 7 - (i / s.corpo.length) * 2; const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, r + 1); g.addColorStop(0, i % 2 ? "#fde68a" : "#fbbf24"); g.addColorStop(1, i % 2 ? "#f59e0b" : "#d97706"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1; ctx.stroke(); }
      const h = s.corpo[0]; mini(ctx, b, h.x * C + 8, h.y * C + 15, 0.34, { espelho: s.d[0] > 0 });
      s.fx.forEach((f) => { ctx.globalAlpha = 1 - f.t / 0.6; ctx.fillStyle = "#fff"; ctx.font = "bold 10px system-ui"; ctx.fillText("+1", f.x - 6, f.y - 8 - f.t * 24); ctx.globalAlpha = 1; });
      ctx.fillStyle = "#0b1328cc"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(4, 4, 44, 17, 8); else ctx.rect(4, 4, 44, 17); ctx.fill(); ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(14, 12.5, 4.5, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 11px system-ui"; ctx.fillText(`${s.comidas}/12`, 22, 17);
    },
  };
}

/* ---------- 7) Quebra-tijolos: arraste o dedo para mover a barra (sem botões) ---------- */
function jogoTijolos() {
  const COLS = 8, LIN = 5, W = 21, H = 9, X0 = 12, Y0 = 30, PY = AJ - 26, cores = [["#fca5a5", "#dc2626"], ["#fdba74", "#ea580c"], ["#fde68a", "#ca8a04"], ["#86efac", "#16a34a"], ["#93c5fd", "#2563eb"]];
  const lancar = (s) => { s.preso = false; const a = (Math.random() - 0.5) * 0.9; s.bola.vx = Math.sin(a) * s.vel; s.bola.vy = -Math.cos(a) * s.vel; };
  return {
    ctl: {},
    mover(s, x) { if (!s.ref) s.ref = { fx: x, px: s.px }; s.px = Math.max(20, Math.min(172, s.ref.px + (x - s.ref.fx))); }, toque(s, x) { s.ref = { fx: x, px: s.px }; if (s.preso && s.espera < 0.9) lancar(s); },
    iniciar: () => ({ px: 96, bola: { x: 96, y: PY - 6, vx: 0, vy: 0 }, preso: true, espera: 1.3, tij: Array(LIN * COLS).fill(1), vidas: 3, quebrados: 0, t: 0, vel: 110, fim: false, frac: 0, fx: [] }),
    passo(s, dt) {
      s.t += dt; const b = s.bola; s.fx.forEach((f) => (f.t += dt)); s.fx = s.fx.filter((f) => f.t < 0.4);
      if (s.k.esq || s.k.dir) s.px = Math.max(20, Math.min(172, s.px + (s.k.dir - s.k.esq) * 130 * dt));
      if (s.preso) { b.x = s.px; b.y = PY - 6; s.espera -= dt; if (s.espera <= 0) lancar(s); return; }
      for (let q = 0; q < 2; q++) {
        b.x += (b.vx * dt) / 2; b.y += (b.vy * dt) / 2;
        if (b.x < 4) { b.x = 4; b.vx = Math.abs(b.vx); } else if (b.x > 188) { b.x = 188; b.vx = -Math.abs(b.vx); } if (b.y < 4) { b.y = 4; b.vy = Math.abs(b.vy); }
        if (b.vy > 0 && b.y > PY - 4 && b.y < PY + 6 && Math.abs(b.x - s.px) < 23) { const k = Math.max(-1, Math.min(1, (b.x - s.px) / 20)); b.vx = k * s.vel * 0.85; b.vy = -Math.sqrt(Math.max(1000, s.vel * s.vel - b.vx * b.vx)); b.y = PY - 4; Som.efeito("toque"); }
        const c = Math.floor((b.x - X0) / W), r = Math.floor((b.y - Y0) / H);
        if (c >= 0 && c < COLS && r >= 0 && r < LIN && s.tij[r * COLS + c]) { s.tij[r * COLS + c] = 0; s.quebrados++; b.vy = -b.vy; s.vel = Math.min(170, s.vel + 1.2); Som.efeito("ping"); s.fx.push({ x: X0 + c * W + W / 2, y: Y0 + r * H + H / 2, t: 0, c: cores[r][1] }); }
      }
      if (b.y > AJ + 6) { s.vidas--; Som.efeito("erro"); s.preso = true; s.espera = 1.2; }
      if (s.quebrados >= LIN * COLS) { s.fim = true; s.frac = 1; Som.efeito("vitoria"); } else if (s.vidas <= 0) { s.fim = true; s.frac = Math.max(0.1, (s.quebrados / (LIN * COLS)) * 0.9); }
    },
    desenhar(s, ctx, b) {
      const g = ctx.createLinearGradient(0, 0, 0, AJ); g.addColorStop(0, "#1e1b4b"); g.addColorStop(1, "#312e81"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, AJ);
      ctx.fillStyle = "#fff"; [[20, 90], [170, 100], [60, 130], [140, 140], [100, 110], [30, 150], [150, 200], [40, 230], [100, 180]].forEach(([x, y], i) => { ctx.globalAlpha = 0.3 + Math.abs(Math.sin(s.t * 2 + i)) * 0.5; ctx.fillRect(x, y, 1.5, 1.5); }); ctx.globalAlpha = 1;
      for (let r = 0; r < LIN; r++) for (let c = 0; c < COLS; c++) { if (!s.tij[r * COLS + c]) continue; const x = X0 + c * W, y = Y0 + r * H, gg = ctx.createLinearGradient(0, y, 0, y + H); gg.addColorStop(0, cores[r][0]); gg.addColorStop(1, cores[r][1]); ctx.fillStyle = gg; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x + 0.7, y + 0.7, W - 1.4, H - 1.4, 2.5); else ctx.rect(x + 1, y + 1, W - 2, H - 2); ctx.fill(); ctx.fillStyle = "#ffffff66"; ctx.fillRect(x + 2.5, y + 1.8, W - 6, 1.4); }
      s.fx.forEach((f) => { const k = f.t / 0.4; ctx.globalAlpha = 1 - k; ctx.fillStyle = f.c; for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.4; ctx.fillRect(f.x + Math.cos(a) * k * 14 - 1.5, f.y + Math.sin(a) * k * 14 - 1.5 + k * 6, 3, 3); } ctx.globalAlpha = 1; });
      mini(ctx, b, s.px, AJ + 1, 0.42, {});
      const pg = ctx.createLinearGradient(0, PY, 0, PY + 8); pg.addColorStop(0, "#67e8f9"); pg.addColorStop(1, "#0891b2"); ctx.fillStyle = pg; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(s.px - 21, PY, 42, 7, 3.5); else ctx.rect(s.px - 21, PY, 42, 7); ctx.fill(); ctx.strokeStyle = "#164e63"; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = "#ffffff80"; ctx.fillRect(s.px - 16, PY + 1.2, 32, 1.4);
      esfera(ctx, s.bola.x, s.bola.y, 4, "#fef08a", "#ca8a04");
      coracoesVida(ctx, s.vidas, 140); ctx.fillStyle = "#fff"; ctx.font = "bold 11px system-ui"; ctx.fillText(`${s.quebrados}/${LIN * COLS}`, 6, 15);
      if (s.preso) { ctx.fillStyle = "#ffffffcc"; ctx.font = "bold 9px system-ui"; ctx.textAlign = "center"; ctx.fillText("Arraste o dedo em qualquer lugar", 96, PY - 50); ctx.textAlign = "left"; }
    },
  };
}

/* ---------- 8) Toupeiras: toque nelas! (cuidado com as bombas) ---------- */
function jogoToupeiras() {
  const POS = [[36, 84], [96, 84], [156, 84], [36, 156], [96, 156], [156, 156], [36, 228], [96, 228], [156, 228]], TEMPO = 35;
  return {
    ctl: {},
    iniciar: () => ({ bur: POS.map(() => ({ t: 0, tipo: null, vida: 1, hit: 0 })), prox: 0.5, tempo: TEMPO, acertos: 0, vidas: 3, t: 0, fx: [], fim: false, frac: 0 }),
    toque(s, x, y) {
      if (s.fim) return; let i = -1, d = 99; POS.forEach(([px, py], k) => { const dd = Math.hypot(x - px, y - py + 6); if (dd < d) { d = dd; i = k; } }); if (d > 27) return;
      const m = s.bur[i]; if (!m.tipo || m.hit) return; m.hit = 0.32;
      if (m.tipo === "b") { s.vidas--; Som.efeito("erro"); s.fx.push({ x: POS[i][0], y: POS[i][1] - 18, t: 0, tx: "-1" }); } else { s.acertos++; Som.efeito("ping"); s.fx.push({ x: POS[i][0], y: POS[i][1] - 18, t: 0, tx: "+1" }); }
    },
    passo(s, dt) {
      s.t += dt; s.tempo -= dt; s.prox -= dt; s.fx.forEach((f) => (f.t += dt)); s.fx = s.fx.filter((f) => f.t < 0.6);
      s.bur.forEach((m) => { if (!m.tipo) return; m.t += dt; if (m.hit > 0) { m.hit -= dt; if (m.hit <= 0) { m.tipo = null; m.hit = 0; } } else if (m.t > m.vida) m.tipo = null; });
      if (s.prox <= 0) { const livres = s.bur.map((m, i) => (m.tipo ? -1 : i)).filter((i) => i >= 0); if (livres.length) { const m = s.bur[livres[(Math.random() * livres.length) | 0]]; m.tipo = Math.random() < 0.18 ? "b" : "m"; m.t = 0; m.hit = 0; m.vida = Math.max(0.6, 1.2 - s.t * 0.014); } s.prox = Math.max(0.3, 0.62 - s.t * 0.006); }
      if (s.vidas <= 0) { s.fim = true; s.frac = Math.max(0.1, Math.min(0.7, s.acertos / 22)); } else if (s.tempo <= 0) { s.fim = true; s.frac = Math.max(0.2, Math.min(1, s.acertos / 20)); Som.efeito("vitoria"); }
    },
    desenhar(s, ctx, b) {
      const g = ctx.createLinearGradient(0, 0, 0, AJ); g.addColorStop(0, "#86efac"); g.addColorStop(1, "#22c55e"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, AJ);
      ctx.fillStyle = "#16a34a55"; for (let i = 0; i < 40; i++) ctx.fillRect((i * 53) % 192, 30 + ((i * 37) % (AJ - 32)), 2, 5);
      POS.forEach(([px, py], i) => {
        const m = s.bur[i], hy = py + 10;
        ctx.fillStyle = "#78350f"; ctx.beginPath(); ctx.ellipse(px, hy, 21, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#1c0f06"; ctx.beginPath(); ctx.ellipse(px, hy, 17, 6, 0, 0, 7); ctx.fill();
        if (m.tipo) {
          let h = Math.min(1, m.t / 0.14); const resta = m.vida - m.t; if (resta < 0.14) h = Math.max(0, resta / 0.14); if (m.hit > 0) h = 1;
          ctx.save(); ctx.beginPath(); ctx.rect(px - 30, py - 60, 60, hy - (py - 60) + 0); ctx.clip();
          const oy = hy - 4 - h * 26 + (m.hit > 0 ? 6 : 0);
          if (m.tipo === "m") { const bg = ctx.createRadialGradient(px - 4, oy - 6, 2, px, oy, 17); bg.addColorStop(0, "#c08457"); bg.addColorStop(1, "#6b3f1d"); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(px, oy, 15, 0, 7); ctx.fill(); ctx.strokeStyle = "#3b200c"; ctx.lineWidth = 1.4; ctx.stroke(); ctx.fillStyle = "#c08457"; ctx.beginPath(); ctx.arc(px - 11, oy - 11, 4.5, 0, 7); ctx.arc(px + 11, oy - 11, 4.5, 0, 7); ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#f5d9b8"; ctx.beginPath(); ctx.ellipse(px, oy + 4, 8, 6, 0, 0, 7); ctx.fill();
            if (m.hit > 0) { ctx.strokeStyle = "#111"; ctx.lineWidth = 1.6; ctx.beginPath(); [-5, 5].forEach((d) => { ctx.moveTo(px + d - 2, oy - 6); ctx.lineTo(px + d + 2, oy - 2); ctx.moveTo(px + d + 2, oy - 6); ctx.lineTo(px + d - 2, oy - 2); }); ctx.stroke(); } else { ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(px - 5, oy - 4, 2.2, 0, 7); ctx.arc(px + 5, oy - 4, 2.2, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(px - 5.5, oy - 5.2, 1.2, 1.2); ctx.fillRect(px + 4.5, oy - 5.2, 1.2, 1.2); }
            ctx.fillStyle = "#f472b6"; ctx.beginPath(); ctx.ellipse(px, oy + 1, 3, 2.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(px - 2, oy + 5, 1.8, 2.5); ctx.fillRect(px + 0.3, oy + 5, 1.8, 2.5); }
          else { esfera(ctx, px, oy, 13, "#475569", "#020617"); ctx.strokeStyle = "#92400e"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + 6, oy - 11); ctx.quadraticCurveTo(px + 12, oy - 20, px + 8, oy - 24); ctx.stroke(); ctx.fillStyle = Math.floor(s.t * 14) % 2 ? "#fde047" : "#fb923c"; ctx.beginPath(); ctx.arc(px + 8, oy - 25, 3.2, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 9px system-ui"; ctx.textAlign = "center"; ctx.fillText("!", px - 2, oy + 3); ctx.textAlign = "left"; }
          ctx.restore();
        }
        ctx.fillStyle = "#a3e635"; ctx.beginPath(); ctx.ellipse(px, hy + 3, 22, 5, 0, 0, Math.PI); ctx.fill(); ctx.strokeStyle = "#4d7c0f"; ctx.lineWidth = 1; ctx.stroke();
      });
      s.fx.forEach((f) => { ctx.globalAlpha = 1 - f.t / 0.6; ctx.fillStyle = f.tx === "+1" ? "#fff" : "#fecaca"; ctx.strokeStyle = "#0008"; ctx.lineWidth = 2.5; ctx.font = "bold 14px system-ui"; ctx.strokeText(f.tx, f.x - 7, f.y - f.t * 30); ctx.fillText(f.tx, f.x - 7, f.y - f.t * 30); ctx.globalAlpha = 1; });
      ctx.fillStyle = "#0b1328cc"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(4, 4, 40, 17, 8); else ctx.rect(4, 4, 40, 17); ctx.fill(); ctx.fillStyle = "#fde047"; ctx.font = "bold 12px system-ui"; ctx.fillText(`★ ${s.acertos}`, 11, 17);
      coracoesVida(ctx, s.vidas, 140); ctx.fillStyle = "#0b1328aa"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(52, 8, 78, 7, 3.5); else ctx.rect(52, 8, 78, 7); ctx.fill(); ctx.fillStyle = s.tempo < 8 ? "#fb7185" : "#22d3ee"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(52, 8, Math.max(7, 78 * Math.max(0, s.tempo) / TEMPO), 7, 3.5); else ctx.rect(52, 8, 70, 7); ctx.fill();
    },
  };
}

/* ---------- 9) Memória: vire as cartas e ache os pares (sem botões) ---------- */
function jogoMemoria() {
  const CW = 38, CH = 64, G = 10, X0 = 8, Y0 = 46;
  const simbolo = (ctx, k, x, y, r) => {
    if (k === 0) estrelaBonita(ctx, x, y, r);
    else if (k === 1) coracaoBonito(ctx, x, y, r * 0.95, 1);
    else if (k === 2) { ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(x, y, r, 0.5, Math.PI * 2 - 0.5); ctx.arc(x + r * 0.45, y - r * 0.1, r * 0.8, Math.PI * 2 - 0.9, 0.9, true); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.2; ctx.stroke(); }
    else if (k === 3) { esfera(ctx, x, y, r, "#fb923c", "#9a3412"); ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); }
    else if (k === 4) { ctx.fillStyle = "#f472b6"; for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - 1.57; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.46, 0, 7); ctx.fill(); } ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, 7); ctx.fill(); }
    else { const g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, "#7dd3fc"); g.addColorStop(1, "#0284c7"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.bezierCurveTo(x + r * 1.1, y + r * 0.2, x + r * 0.8, y + r, x, y + r); ctx.bezierCurveTo(x - r * 0.8, y + r, x - r * 1.1, y + r * 0.2, x, y - r); ctx.fill(); ctx.strokeStyle = "#075985"; ctx.lineWidth = 1.2; ctx.stroke(); }
  };
  return {
    ctl: {},
    iniciar() { const ks = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5); return { cartas: ks.map((k) => ({ s: k, v: false, ok: false, f: 0 })), abertas: [], bloq: 0, pares: 0, jogadas: 0, erros: 0, t: 0, fim: false, frac: 0 }; },
    toque(s, x, y) {
      if (s.fim || s.bloq > 0) return; const c = Math.floor((x - X0) / (CW + G)), r = Math.floor((y - Y0) / (CH + G)); if (c < 0 || c > 3 || r < 0 || r > 2) return;
      if ((x - X0) % (CW + G) > CW || (y - Y0) % (CH + G) > CH) return; const i = r * 4 + c, cd = s.cartas[i]; if (cd.v || cd.ok) return;
      cd.v = true; Som.efeito("toque"); s.abertas.push(i);
      if (s.abertas.length === 2) { s.jogadas++; const [a, b] = s.abertas;
        if (s.cartas[a].s === s.cartas[b].s) { s.cartas[a].ok = s.cartas[b].ok = true; s.cartas[a].f = s.cartas[b].f = 1; s.abertas = []; s.pares++; Som.efeito("ping"); if (s.pares === 6) { s.fim = true; s.frac = Math.max(0.4, Math.min(1, 1 - Math.max(0, s.erros - 2) * 0.08)); Som.efeito("vitoria"); } }
        else { s.erros++; s.bloq = 0.8; } }
    },
    passo(s, dt) { s.t += dt; if (s.bloq > 0) { s.bloq -= dt; if (s.bloq <= 0) { s.abertas.forEach((i) => (s.cartas[i].v = false)); s.abertas = []; } } s.cartas.forEach((c) => { const alvo = c.v || c.ok ? 1 : 0; c.f += (alvo - c.f) * Math.min(1, dt * 14); }); },
    desenhar(s, ctx, b) {
      const g = ctx.createLinearGradient(0, 0, 0, AJ); g.addColorStop(0, "#4c1d95"); g.addColorStop(1, "#1e1b4b"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, AJ);
      ctx.fillStyle = "#ffffff22"; for (let i = 0; i < 14; i++) ctx.fillRect((i * 71) % 192, (i * 43) % AJ, 2, 2);
      s.cartas.forEach((c, i) => {
        const x = X0 + (i % 4) * (CW + G), y = Y0 + ((i / 4) | 0) * (CH + G), cx = x + CW / 2, cy = y + CH / 2, sx = Math.abs(1 - 2 * c.f) * 0.96 + 0.04, front = c.f > 0.5;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(sx, 1); ctx.fillStyle = "#00000040"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-CW / 2 + 1, -CH / 2 + 3, CW, CH, 7); else ctx.rect(-CW / 2, -CH / 2 + 3, CW, CH); ctx.fill();
        const cg = ctx.createLinearGradient(0, -CH / 2, 0, CH / 2); if (front) { cg.addColorStop(0, "#ffffff"); cg.addColorStop(1, c.ok ? "#bbf7d0" : "#e2e8f0"); } else { cg.addColorStop(0, "#c084fc"); cg.addColorStop(1, "#7c3aed"); }
        ctx.fillStyle = cg; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-CW / 2, -CH / 2, CW, CH, 7); else ctx.rect(-CW / 2, -CH / 2, CW, CH); ctx.fill(); ctx.strokeStyle = front ? (c.ok ? "#16a34a" : "#94a3b8") : "#4c1d95"; ctx.lineWidth = 1.6; ctx.stroke();
        if (front) simbolo(ctx, c.s, 0, 0, 14); else { ctx.strokeStyle = "#e9d5ff"; ctx.lineWidth = 1.2; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-CW / 2 + 5, -CH / 2 + 5, CW - 10, CH - 10, 4); else ctx.rect(-CW / 2 + 5, -CH / 2 + 5, CW - 10, CH - 10); ctx.stroke(); ctx.fillStyle = "#e9d5ff"; ctx.font = "bold 16px system-ui"; ctx.textAlign = "center"; ctx.fillText("?", 0, 6); ctx.textAlign = "left"; }
        ctx.restore();
      });
      mini(ctx, b, 30, 30, 0.42, {}); ctx.fillStyle = "#fff"; ctx.font = "bold 12px system-ui"; ctx.fillText(`Pares ${s.pares}/6`, 58, 20); ctx.fillStyle = "#c4b5fd"; ctx.font = "10px system-ui"; ctx.fillText(`Jogadas: ${s.jogadas}`, 58, 31);
      
    },
  };
}

/* ---------- 10) Voa-voa: toque para subir, passe entre as torres ---------- */
function jogoVoa() {
  const GAP = 64, PX = 58, TEMPO = 60;
  return {
    ctl: { acao: "pular" }, tecla(s, k) { if (k === "acao" || k === "cima") this.toque(s); },
    toque(s) { if (s.fim) return; s.vy = -150; s.ligou = true; Som.efeito("pulo"); },
    iniciar: () => ({ y: AJ / 2 - 4, vy: 0, canos: [], prox: 0.9, t: 0, tempo: TEMPO, vidas: 3, inv: 0, pontos: 0, ligou: false, fim: false, frac: 0 }),
    passo(s, dt) {
      s.t += dt; if (s.inv > 0) s.inv -= dt; if (!s.ligou) { s.y = AJ / 2 - 4 + Math.sin(s.t * 4) * 4; return; }
      s.tempo -= dt; s.vy = Math.min(220, s.vy + 430 * dt); s.y += s.vy * dt; s.prox -= dt;
      if (s.prox <= 0) { s.prox = 1.6; s.canos.push({ x: 204, gy: 66 + Math.random() * (AJ - 66 - 66 - 12), p: false }); }
      s.canos.forEach((c) => { c.x -= 62 * dt; if (!c.p && c.x + 15 < PX) { c.p = true; s.pontos++; Som.efeito("ping"); } }); s.canos = s.canos.filter((c) => c.x > -30);
      let bate = s.y > AJ - 18 || s.y < 8; s.canos.forEach((c) => { if (Math.abs(PX - c.x) < 22 && (s.y - 9 < c.gy - GAP / 2 || s.y + 9 > c.gy + GAP / 2)) bate = true; });
      if (bate && s.inv <= 0) { s.vidas--; s.inv = 1.3; Som.efeito("erro"); s.y = AJ / 2 - 4; s.vy = -60; s.canos = s.canos.filter((c) => c.x > PX + 50 || c.x < PX - 40); }
      if (s.vidas <= 0) { s.fim = true; s.frac = Math.max(0.1, Math.min(0.85, s.pontos / 16)); } else if (s.tempo <= 0) { s.fim = true; s.frac = Math.max(0.2, Math.min(1, s.pontos / 14)); Som.efeito("vitoria"); }
    },
    desenhar(s, ctx, b) {
      const g = ctx.createLinearGradient(0, 0, 0, AJ); g.addColorStop(0, "#38bdf8"); g.addColorStop(1, "#e0f2fe"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, AJ);
      for (let i = 0; i < 5; i++) nuvem(ctx, ((i * 90 - s.t * 12) % 450 + 450) % 450 - 40, 28 + (i % 4) * 56, 46);
      ctx.fillStyle = "#86efac"; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(((i * 70 - s.t * 18) % 420 + 420) % 420 - 40, AJ - 6, 34, Math.PI, 0); ctx.fill(); }
      s.canos.forEach((c) => {
        [[0, c.gy - GAP / 2], [c.gy + GAP / 2, AJ]].forEach(([y0, y1], k) => { const x = c.x - 15, w = 30, pg = ctx.createLinearGradient(x, 0, x + w, 0); pg.addColorStop(0, "#4ade80"); pg.addColorStop(0.5, "#22c55e"); pg.addColorStop(1, "#15803d"); ctx.fillStyle = pg; ctx.fillRect(x + 3, y0, w - 6, y1 - y0); ctx.strokeStyle = "#14532d"; ctx.lineWidth = 1.4; ctx.strokeRect(x + 3, y0, w - 6, y1 - y0); const cy = k === 0 ? y1 - 11 : y0; ctx.fillStyle = pg; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, cy, w, 11, 3); else ctx.rect(x, cy, w, 11); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#ffffff55"; ctx.fillRect(x + 4, cy + 2, 3, 7); });
      });
      const ch = ctx.createLinearGradient(0, AJ - 12, 0, AJ); ch.addColorStop(0, "#a3e635"); ch.addColorStop(1, "#4d7c0f"); ctx.fillStyle = ch; ctx.fillRect(0, AJ - 10, 192, 10);
      if (!(s.inv > 0 && Math.floor(s.t * 14) % 2)) { ctx.save(); ctx.translate(PX, s.y); ctx.rotate(Math.max(-0.4, Math.min(0.6, s.vy / 360))); ctx.strokeStyle = "#475569"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, -4); ctx.quadraticCurveTo(8, -16, 6, -22); ctx.stroke(); esfera(ctx, 6, -28, 7, "#f472b6", "#9d174d"); mini(ctx, b, 0, 12, 0.5, {}); ctx.restore(); }
      ctx.fillStyle = "#0b1328cc"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(4, 4, 44, 18, 9); else ctx.rect(4, 4, 44, 18); ctx.fill(); ctx.fillStyle = "#fde047"; ctx.font = "bold 12px system-ui"; ctx.fillText(`★ ${s.pontos}`, 12, 17);
      coracoesVida(ctx, s.vidas, 140);
      if (!s.ligou) { ctx.fillStyle = "#0b1328cc"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(36, AJ / 2 + 50, 120, 20, 10); else ctx.rect(36, AJ / 2 + 50, 120, 20); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "center"; ctx.fillText("Toque para voar!", 96, AJ / 2 + 64); ctx.textAlign = "left"; }
    },
  };
}

/* ---------- um jeitinho de desenhar o bichinho pequeno nas brincadeiras ---------- */
const pequeno = (ctx, b, x, base, o = {}) => { const a = desenharBicho(ctx, b.especie, x, base, 1, { fechado: !!o.fechado, espelho: !!o.espelho, tinta: tintaDe(b) }); vestir(ctx, b, a); return a; };
function marcadores(ctx, lista) {                      // fileira de bolinhas no topo: cinza = falta, verde = acertou, vermelho = errou
  lista.forEach((v, i) => { const x = 10 + i * 16; ctx.fillStyle = "#0b1328"; ctx.beginPath(); ctx.arc(x + 5, 12, 7, 0, 7); ctx.fill(); ctx.fillStyle = v === 1 ? "#34d399" : v === -1 ? "#fb7185" : "#475569"; ctx.beginPath(); ctx.arc(x + 5, 12, 5, 0, 7); ctx.fill(); });
}

/* ---------- 1) basquete: a cesta anda devagar; toque para arremessar ---------- */
function quadra(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, "#0b1230"); g.addColorStop(1, "#24407f"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, 192);
  [[40, 0.1], [150, 0.12]].forEach(([x, a]) => { const l = ctx.createLinearGradient(x, 0, x, 120); l.addColorStop(0, `rgba(255,255,255,${a * 2})`); l.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = l; ctx.beginPath(); ctx.moveTo(x - 8, 0); ctx.lineTo(x + 8, 0); ctx.lineTo(x + 46, 120); ctx.lineTo(x - 46, 120); ctx.fill(); });
  const cs = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#e879f9"]; for (let i = 0; i < 16; i++) { const x = 6 + i * 12, y = 100 + (i % 3) * 2; ctx.fillStyle = "#111a38"; ctx.fillRect(x - 4, y + 5, 9, 16); ctx.fillStyle = cs[i % 5]; ctx.beginPath(); ctx.arc(x, y + 1 + Math.sin(t * 3 + i) * 0.8, 4.4, 0, 7); ctx.fill(); }
  const m = ctx.createLinearGradient(0, 120, 0, 192); m.addColorStop(0, "#d58a3c"); m.addColorStop(1, "#8f4a17"); ctx.fillStyle = m; ctx.fillRect(0, 120, 192, 72);
  ctx.fillStyle = "#ffffff14"; for (let y = 126; y < 192; y += 14) ctx.fillRect(0, y, 192, 6); ctx.fillStyle = "#6b3410"; for (let x = 0; x < 192; x += 32) ctx.fillRect(x, 120, 1.5, 72);
  ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(96, 192, 42, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 122); ctx.lineTo(192, 122); ctx.stroke();
  ctx.fillStyle = "#00000022"; ctx.fillRect(0, 120, 192, 3);
}
function jogoBasquete() {
  return {
    ctl: { acao: "basquete" }, tecla(s, k) { if (k === "acao") this.toque(s); },
    iniciar: () => ({ hx: 110, dir: 1, usadas: 0, res: [0, 0, 0, 0, 0], bola: null, t: 0, pontos: 0, feliz: 0, confete: [], fim: false, frac: 0 }),
    toque(s) { if (s.bola || s.usadas >= 5 || s.fim) return; Som.efeito("bola"); s.bola = { t: 0, tx: s.hx, dur: 0.5 }; },
    passo(s, dt) {
      s.t += dt; const v = 24 + s.usadas * 7; s.hx += s.dir * v * dt; if (s.hx > 160) { s.hx = 160; s.dir = -1; } if (s.hx < 80) { s.hx = 80; s.dir = 1; }
      if (s.feliz > 0) s.feliz -= dt;
      s.confete.forEach((c) => { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 220 * dt; }); s.confete = s.confete.filter((c) => c.y < 200);
      if (s.bola) { s.bola.t += dt; if (s.bola.t >= s.bola.dur) {
        const dentro = Math.abs(s.hx - s.bola.tx) < 24; s.res[s.usadas] = dentro ? 1 : -1; s.usadas++;
        if (dentro) { s.pontos++; s.feliz = 1; Som.efeito("cesta"); for (let i = 0; i < 18; i++) s.confete.push({ x: s.hx, y: 56, vx: (Math.random() - 0.5) * 140, vy: -80 - Math.random() * 90, cor: ["#fde047", "#22d3ee", "#e879f9", "#34d399"][i % 4] }); } else Som.efeito("erro");
        s.bola = null; if (s.usadas >= 5) { s.fim = true; s.frac = Math.max(0.5, s.pontos / 5); }
      } }
    },
    desenhar(s, ctx, b) {
      quadra(ctx, s.t);
      const hx = s.hx;
      ctx.fillStyle = "#0b1328"; ctx.fillRect(hx - 28, 18, 56, 40); ctx.fillStyle = "#f8fafc"; ctx.fillRect(hx - 26, 20, 52, 36); ctx.fillStyle = "#ef4444"; ctx.fillRect(hx - 11, 36, 22, 14); ctx.fillStyle = "#fff"; ctx.fillRect(hx - 8, 39, 16, 8);
      ctx.fillStyle = "#fb923c"; ctx.fillRect(hx - 20, 56, 40, 5);
      ctx.strokeStyle = "#ffffffd0"; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(hx + i * 6, 61); ctx.lineTo(hx + i * 3.5 + (s.feliz > 0 ? Math.sin(s.t * 30) * 2 : 0), 80); ctx.stroke(); }
      if (!s.bola && s.usadas < 5) { ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.moveTo(hx - 7, 4); ctx.lineTo(hx + 7, 4); ctx.lineTo(hx, 14); ctx.fill(); }   // setinha: o alvo
      const px = 56, py = 176 - (s.feliz > 0 ? Math.abs(Math.sin(s.t * 14)) * 14 : 0);
      let bx = px + 16, by = py - 34;
      if (s.bola) { const u = s.bola.t / s.bola.dur; bx = px + 16 + (s.bola.tx - px - 16) * u; by = (py - 34) + (60 - (py - 34)) * u - Math.sin(u * Math.PI) * 50; ctx.fillStyle = "#00000033"; ctx.beginPath(); ctx.ellipse(bx, 176, 8, 3, 0, 0, 7); ctx.fill(); }
      pequeno(ctx, b, px, py);
      if (s.usadas < 5 || s.bola) bolinha(ctx, bx, by, s.bola ? 8 - (s.bola.t / s.bola.dur) * 3 : 8);
      s.confete.forEach((c) => { ctx.fillStyle = c.cor; ctx.fillRect(c.x, c.y, 4, 4); });
      marcadores(ctx, s.res);
    },
  };
}

/* ---------- 2) buscar: toque no campo para jogar; ele corre e traz de volta ---------- */
function campoBonito(ctx, t) {
  cenaCampo(ctx, t);
  [[24, 102], [170, 98]].forEach(([x, y]) => { ctx.fillStyle = "#00000028"; ctx.beginPath(); ctx.ellipse(x, y + 12, 20, 5, 0, 0, 7); ctx.fill(); const tr = ctx.createLinearGradient(x - 3, 0, x + 4, 0); tr.addColorStop(0, "#a16207"); tr.addColorStop(1, "#6b3a0e"); ctx.fillStyle = tr; ctx.fillRect(x - 3, y - 8, 7, 20); esfera(ctx, x, y - 26, 19, "#4ade80", "#166534"); esfera(ctx, x - 9, y - 18, 12, "#4ade80", "#15803d"); esfera(ctx, x + 10, y - 18, 12, "#4ade80", "#15803d"); });
  [[60, 150, "#f472b6"], [140, 132, "#fde047"], [172, 170, "#ffffff"], [90, 182, "#e879f9"], [20, 142, "#fde047"], [118, 164, "#fb7185"]].forEach(([x, y, c]) => { ctx.strokeStyle = "#15803d"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 8); ctx.stroke(); ctx.fillStyle = c; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + Math.cos(k * 1.256) * 2.6, y + Math.sin(k * 1.256) * 2.6, 2, 0, 7); ctx.fill(); } ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); });
}
function jogoBuscar() {
  return {
    ctl: { dirs: ["esq", "dir", "cima", "baixo"], acao: "buscar" }, tecla(s, k) { if (k === "acao") this.toque(s, s.mira.x, s.mira.y); },
    iniciar: () => ({ mira: { x: 140, y: 150 }, poeira: [], pouso: 0, n: 0, fase: "espera", bola: { x: 70, y: 150 }, alvo: null, voo: 0, bx: 52, by: 170, dirv: 1, t: 0, res: [0, 0, 0, 0, 0], fim: false, frac: 1 }),
    toque(s, x, y) { if (s.fase !== "espera" || s.fim) return; s.alvo = { x: Math.max(96, Math.min(176, x)), y: Math.max(112, Math.min(176, y)) }; s.voo = 0; s.fase = "voando"; Som.efeito("bola"); },
    passo(s, dt) {
      if (s.fase === "espera") { s.mira.x = Math.max(96, Math.min(176, s.mira.x + (s.k.dir - s.k.esq) * 70 * dt)); s.mira.y = Math.max(112, Math.min(176, s.mira.y + (s.k.baixo - s.k.cima) * 70 * dt)); }
      s.t += dt; s.poeira.forEach((p) => { p.v -= dt * 2.2; p.y -= dt * 8; }); s.poeira = s.poeira.filter((p) => p.v > 0);
      if ((s.fase === "corre" || s.fase === "volta") && Math.floor(s.t * 14) !== Math.floor((s.t - dt) * 14)) s.poeira.push({ x: s.bx - s.dirv * 9, y: s.by - 2, v: 1 });
      if (s.fase === "voando") { s.voo += dt / 0.55; const u = Math.min(1, s.voo); s.bola = { x: 70 + (s.alvo.x - 70) * u, y: 150 + (s.alvo.y - 150) * u - Math.sin(u * Math.PI) * 40 }; if (u >= 1) { s.fase = "corre"; s.pouso = s.t; Som.efeito("bola"); } }
      else if (s.fase === "corre") { const d = s.alvo.x - s.bx, p = 120 * dt; s.dirv = d >= 0 ? 1 : -1; if (Math.abs(d) <= p) { s.bx = s.alvo.x; s.fase = "volta"; } else s.bx += Math.sign(d) * p; s.by += (s.alvo.y + 8 - s.by) * Math.min(1, dt * 6); }
      else if (s.fase === "volta") { const d = 52 - s.bx, p = 120 * dt; s.dirv = -1; s.by += (170 - s.by) * Math.min(1, dt * 4); s.bola = { x: s.bx, y: s.by - 38 }; if (Math.abs(d) <= p) { s.bx = 52; s.by = 170; s.res[s.n] = 1; s.n++; s.fase = "espera"; s.bola = { x: 70, y: 150 }; Som.efeito("ping"); Som.voz(estado.bicho.especie); pulo = 0; if (s.n >= 5) s.fim = true; } else s.bx += Math.sign(d) * p; }
      if (s.fase === "espera") s.by += (170 - s.by) * Math.min(1, dt * 6);
    },
    desenhar(s, ctx, b) {
      campoBonito(ctx, s.t); marcadores(ctx, s.res);
      s.poeira.forEach((p) => { ctx.fillStyle = `rgba(255,255,255,${p.v * 0.7})`; ctx.beginPath(); ctx.arc(p.x, p.y, 3 + (1 - p.v) * 5, 0, 7); ctx.fill(); });
      if (s.fase === "espera") { const r = 8 + (Math.sin(s.t * 6) + 1) * 4; ctx.strokeStyle = "#ffffffaa"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.mira.x, s.mira.y, r, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s.mira.x - 4, s.mira.y); ctx.lineTo(s.mira.x + 4, s.mira.y); ctx.moveTo(s.mira.x, s.mira.y - 4); ctx.lineTo(s.mira.x, s.mira.y + 4); ctx.stroke(); }
      const hop = s.fase === "corre" || s.fase === "volta" ? Math.abs(Math.sin(s.t * 16)) * 6 : 0;
      if (s.fase === "espera") { ctx.fillStyle = "#0b1328cc"; ctx.fillRect(86, 120, 74, 22); pix(ctx, "bola", 92, 123, 2); ctx.fillStyle = "#f8fafc"; ctx.fillRect(112, 129, 24, 4); ctx.fillRect(130, 125, 4, 12); ctx.fillRect(134, 127, 4, 8); }
      pequeno(ctx, b, s.bx, s.by - hop, { espelho: s.dirv < 0 });
      if (s.fase === "espera" || s.fase === "voando" || s.fase === "volta") bolinha(ctx, s.bola.x, s.bola.y, 7);
      else { const q = Math.abs(Math.sin((s.t - s.pouso) * 11)) * 10 * Math.max(0, 1 - (s.t - s.pouso) / 0.7); ctx.fillStyle = "#0000002e"; ctx.beginPath(); ctx.ellipse(s.alvo.x, s.alvo.y + 6, 7, 3, 0, 0, 7); ctx.fill(); bolinha(ctx, s.alvo.x, s.alvo.y - q, 7); }
    },
  };
}

/* ---------- 3) estrelas: arraste para o lado e pegue as estrelas, desviando das pedras ---------- */
function estrelaBonita(ctx, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.5); g.addColorStop(0, "#fde04755"); g.addColorStop(1, "#fde04700"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.5, 0, 7); ctx.fill();
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.46 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
  const f = ctx.createLinearGradient(0, -r, 0, r); f.addColorStop(0, "#fff176"); f.addColorStop(1, "#f59e0b"); ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.2; ctx.lineJoin = "round"; ctx.stroke(); ctx.restore();
}
function pedraBonita(ctx, x, y) {
  ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.ellipse(x, y + 9, 11, 3, 0, 0, 7); ctx.fill();
  const g = ctx.createLinearGradient(x - 10, y - 9, x + 10, y + 9); g.addColorStop(0, "#cbd5e1"); g.addColorStop(1, "#475569"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 10, y + 6); ctx.lineTo(x - 8, y - 4); ctx.lineTo(x - 1, y - 9); ctx.lineTo(x + 8, y - 6); ctx.lineTo(x + 11, y + 5); ctx.lineTo(x + 3, y + 9); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.4; ctx.lineJoin = "round"; ctx.stroke();
  ctx.fillStyle = "#ffffff55"; ctx.beginPath(); ctx.moveTo(x - 6, y - 2); ctx.lineTo(x - 1, y - 6); ctx.lineTo(x + 2, y - 3); ctx.lineTo(x - 4, y + 1); ctx.fill();
}
function jogoEstrelas() {
  return {
    ctl: { dirs: ["esq", "dir"] },
    iniciar: () => { const lista = Array.from({ length: 12 }, () => "e").concat(Array(4).fill("p")).sort(() => Math.random() - 0.5); return { x: 96, alvo: 96, lista, i: 0, itens: [], t: 0, prox: 0.4, pegas: 0, piscar: 0, fim: false, frac: 0 }; },
    toque(s, x) { s.alvo = x; }, mover(s, x) { s.alvo = x; },
    passo(s, dt) {
      s.t += dt; if (s.k.dir || s.k.esq) s.alvo = Math.max(20, Math.min(172, s.alvo + (s.k.dir - s.k.esq) * 150 * dt)); s.x += (s.alvo - s.x) * Math.min(1, dt * 9); s.x = Math.max(20, Math.min(172, s.x)); if (s.piscar > 0) s.piscar -= dt;
      s.prox -= dt; if (s.prox <= 0 && s.i < s.lista.length) { s.itens.push({ x: 14 + Math.random() * 164, y: -8, t: s.lista[s.i], v: 70 + Math.random() * 30 }); s.i++; s.prox = 0.62; }
      s.itens.forEach((it) => { it.y += it.v * dt; });
      s.itens = s.itens.filter((it) => {
        if (it.y > 148 && it.y < 188 && Math.abs(it.x - s.x) < 20) { if (it.t === "e") { s.pegas++; Som.efeito("ping"); pulo = 6; } else { s.piscar = 0.5; Som.efeito("erro"); } return false; }
        return it.y < 200;
      });
      if (s.i >= s.lista.length && !s.itens.length) { s.fim = true; s.frac = s.pegas / 12; }
    },
    desenhar(s, ctx, b) {
      cenaCampo(ctx, s.t); ctx.fillStyle = "#1e293b66"; ctx.fillRect(0, 0, 192, 96);
      s.itens.forEach((it) => { if (it.t === "e") estrelaBonita(ctx, it.x, it.y, 10, Math.sin(s.t * 3 + it.x) * 0.25); else pedraBonita(ctx, it.x, it.y); });
      for (let i = 0; i < 12; i++) { ctx.globalAlpha = i < s.pegas ? 1 : 0.28; estrelaBonita(ctx, 14 + i * 14.5, 11, 5.2); } ctx.globalAlpha = 1;
      if (s.piscar <= 0 || Math.floor(s.t * 20) % 2) pequeno(ctx, b, s.x, 182);
    },
  };
}


/* bichinho pequeno para as fases de plataforma (esc fracionário) */
const mini = (ctx, b, x, base, esc, o = {}) => { const a = desenharBicho(ctx, b.especie, x, base, esc, { fechado: !!o.fechado, espelho: !!o.espelho, tinta: tintaDe(b) }); vestir(ctx, b, a); return a; };
const coracoesVida = (ctx, n, x0) => { for (let i = 0; i < 3; i++) coracaoBonito(ctx, x0 + 8 + i * 17, 11, 7, 1, 0, i < n ? 1 : 0); };

/* ---------- 4) Pulapula: setas para andar, botão para pular (segure para pular mais alto). Bata nos blocos "?" por baixo, suba nas plataformas, pegue moedas e pise nos bichinhos ---------- */
function jogoPulapula() {
  const CH = 148 + (AJ - 192), FIM = 1700, BURACOS = [[330, 34], [760, 40], [1180, 44]], BLOCOS = [[210, 22], [540, 24], [900, 24], [1400, 22]];
  const PLAT = [[262, 42, 70], [430, 40, 54], [630, 44, 76], [840, 40, 62], [1050, 42, 90], [1270, 44, 70], [1500, 40, 80]];
  const BLQ = [[286, "q"], [270, "t"], [302, "t"], [660, "q"], [644, "t"], [676, "t"], [1075, "q"], [1091, "q"], [1059, "t"], [1107, "t"], [1290, "q"], [1522, "q"], [1506, "t"], [1538, "t"], [450, "q"]];
  const moedas = [];
  BURACOS.forEach(([x, w]) => { for (let i = 0; i < 5; i++) moedas.push({ x: x + 2 + i * (w / 4.5), y: CH - 28 - Math.sin((i / 4) * Math.PI) * 28 }); });
  PLAT.forEach(([x, h, w]) => { for (let i = 0; i < 4; i++) moedas.push({ x: x + 10 + i * ((w - 20) / 3), y: CH - h - 14 }); });
  [100, 130, 160, 470 - 60, 580, 610, 800, 1000, 1030, 1160, 1350, 1380, 1600, 1630, 1660].forEach((x, i) => moedas.push({ x, y: CH - 14 - (i % 3) * 3 }));
  [286, 666, 1083, 1300, 1530].forEach((x) => { for (let i = -1; i <= 1; i++) moedas.push({ x: x + i * 14, y: CH - 112 }); });   // moedas lá em cima, no "teto"
  return {
    ctl: { dirs: ["esq", "dir"], acao: "pular" }, tecla(s, k) { if (k === "acao" || k === "cima") this.toque(s); },
    iniciar: () => ({ dir: 1, x: 20, y: CH, vy: 0, no: true, solo: 0, t: 0, tempo: 90, vidas: 3, inv: 0, moedas: 0, total: moedas.length + BLQ.filter(([, k]) => k === "q").length, pegas: new Set(),
      blocos: BLQ.map(([x, k]) => ({ x, y: CH - 88, w: 16, h: 16, k, usado: false, bump: 0 })).concat(BLOCOS.map(([x, h]) => ({ x, y: CH - h, w: 18, h, k: "b", usado: false, bump: 0 }))), fx: [],
      inimigos: [420, 580, 700, 960, 1120, 1330, 1560].map((x) => ({ x, x0: x, vivo: true })), morcegos: [[500, 60], [980, 56], [1450, 62]].map(([x, y]) => ({ x, x0: x, y0: CH - y, y: CH - y, vivo: true })), fim: false, frac: 0 }),
    toque(s) { if (s.fim) return; if (s.no || s.solo > 0) { s.vy = -262; s.no = false; s.solo = 0; Som.efeito("pulo"); } },
    passo(s, dt) {
      s.t += dt; s.tempo -= dt; if (s.inv > 0) s.inv -= dt; if (s.solo > 0) s.solo -= dt;
      const vx = (s.k.dir - s.k.esq) * 82; if (vx) s.dir = vx > 0 ? 1 : -1; s.x = Math.max(12, s.x + vx * dt);
      if (!s.k.acao && s.vy < -120) s.vy = -120;                                                      // soltou o botão: pulo mais baixo
      const yAnt = s.y; s.vy += 660 * dt; s.y += s.vy * dt;
      let chao = BURACOS.some(([x, w]) => s.x > x + 4 && s.x < x + w - 4) ? 999 : CH;
      PLAT.forEach(([x, h, w]) => { const topo = CH - h; if (s.x + 6 > x && s.x - 6 < x + w && yAnt <= topo + 2 && s.y >= topo && s.vy >= 0) chao = Math.min(chao, topo); });
      s.blocos.forEach((q) => {
        if (s.x + 8 > q.x && s.x - 8 < q.x + q.w) {
          if (yAnt <= q.y + 3 && s.vy >= 0 && s.y >= q.y) chao = Math.min(chao, q.y);
          else if (s.vy < 0 && s.y - 26 <= q.y + q.h && yAnt - 26 >= q.y + q.h - 3) { s.y = q.y + q.h + 26; s.vy = 70; q.bump = 0.18; if (q.k === "q" && !q.usado) { q.usado = true; s.moedas++; s.fx.push({ x: q.x + 8, y: q.y - 4, t: 0 }); Som.efeito("ping"); } else Som.efeito("toque"); }
          else if (s.y > q.y + 3 && s.y - 26 < q.y + q.h) s.x = s.x < q.x + q.w / 2 ? q.x - 8 : q.x + q.w + 8;
        }
      });
      const estavaNo = s.no;
      if (s.y >= chao && s.vy >= 0) { s.y = chao; s.vy = 0; s.no = true; s.solo = 0.1; } else { s.no = false; if (estavaNo && s.vy >= 0) s.solo = 0.1; }
      s.blocos.forEach((q) => { if (q.bump > 0) q.bump -= dt; }); s.fx.forEach((f) => (f.t += dt)); s.fx = s.fx.filter((f) => f.t < 0.7);
      if (s.y > AJ + 18) { s.vidas--; Som.efeito("erro"); const b0 = BURACOS.filter(([x]) => x < s.x).pop(); s.x = (b0 ? b0[0] : 0) - 40; s.y = CH; s.vy = 0; s.no = true; s.inv = 1.4; }
      const dano = () => { if (s.inv <= 0) { s.vidas--; s.inv = 1.4; s.vy = -160; s.no = false; Som.efeito("erro"); } };
      s.inimigos.forEach((e) => { if (!e.vivo) return; e.x = e.x0 - 22 + Math.sin(s.t * 0.9 + e.x0) * 22;
        if (Math.abs(s.x - e.x) < 12 && s.y > CH - 22 && s.y < CH + 8) { if (s.vy > 40 && s.y < CH - 6) { e.vivo = false; s.vy = -190; s.moedas++; Som.efeito("ping"); } else dano(); } });
      s.morcegos.forEach((m) => { if (!m.vivo) return; m.x = m.x0 + Math.sin(s.t * 1.1 + m.x0) * 46; m.y = m.y0 + Math.sin(s.t * 3 + m.x0) * 12;
        if (Math.abs(s.x - m.x) < 12 && s.y - 26 < m.y + 6 && s.y > m.y - 6) { if (s.vy > 60 && s.y < m.y + 6) { m.vivo = false; s.vy = -200; s.moedas++; Som.efeito("ping"); } else dano(); } });
      moedas.forEach((m, i) => { if (!s.pegas.has(i) && Math.abs(m.x - s.x) < 11 && Math.abs(m.y - (s.y - 12)) < 17) { s.pegas.add(i); s.moedas++; Som.efeito("ping"); } });
      if (s.x >= FIM) { s.fim = true; s.frac = Math.max(0.45, Math.min(1, 0.5 + 0.5 * Math.min(1, s.moedas / s.total) - (3 - s.vidas) * 0.08)); Som.efeito("vitoria"); }
      else if (s.vidas <= 0 || s.tempo <= 0) { s.fim = true; s.frac = 0.1 + 0.25 * (s.x / FIM); }
    },
    desenhar(s, ctx, b) {
      const cam = Math.max(0, s.x - 70), t = s.t, X = (x) => Math.round(x - cam);
      const rr = (x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
      const g = ctx.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, "#2aa8f0"); g.addColorStop(1, "#d6f1ff"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, AJ);
      const sol = ctx.createRadialGradient(168, 40, 2, 168, 40, 34); sol.addColorStop(0, "#fff7ae"); sol.addColorStop(1, "#fde04700"); ctx.fillStyle = sol; ctx.fillRect(120, 0, 72, 70);
      for (let i = 0; i < 6; i++) nuvem(ctx, ((i * 130 - cam * 0.25) % 420 + 420) % 420 - 50, 30 + (i % 4) * 36, 44 + (i % 2) * 14);
      [[0.5, "#7ee0a0", 50, 0], [0.7, "#34b868", 34, 60]].forEach(([p, cor, r, off]) => { const gg = ctx.createLinearGradient(0, CH - r, 0, CH); gg.addColorStop(0, cor); gg.addColorStop(1, "#15803d"); ctx.fillStyle = gg; for (let i = 0; i < 7; i++) { const x = ((i * 120 + off - cam * p) % 520 + 520) % 520 - 80; ctx.beginPath(); ctx.arc(x + 40, CH + 8, r, Math.PI, 0); ctx.fill(); } });
      const ch = ctx.createLinearGradient(0, CH, 0, 192); ch.addColorStop(0, "#b45f1c"); ch.addColorStop(1, "#6b3410"); ctx.fillStyle = ch; ctx.fillRect(0, CH, 192, 44);
      ctx.fillStyle = "#00000022"; for (let y = CH + 12; y < 192; y += 12) for (let x = -((cam | 0) % 24); x < 192; x += 24) ctx.fillRect(x + ((y / 12) % 2) * 12, y, 22, 1.5);
      const gr = ctx.createLinearGradient(0, CH, 0, CH + 8); gr.addColorStop(0, "#a3e635"); gr.addColorStop(1, "#4d7c0f"); ctx.fillStyle = gr; ctx.fillRect(0, CH, 192, 8);
      ctx.fillStyle = "#bef264"; for (let x = -((cam | 0) % 10); x < 192; x += 10) { ctx.beginPath(); ctx.moveTo(x, CH); ctx.lineTo(x + 2.5, CH - 3); ctx.lineTo(x + 5, CH); ctx.fill(); }
      BURACOS.forEach(([x, w]) => { const pg = ctx.createLinearGradient(0, CH, 0, 192); pg.addColorStop(0, "#050816"); pg.addColorStop(1, "#1e3a8a"); ctx.fillStyle = pg; ctx.fillRect(X(x), CH, w, 44); });
      PLAT.forEach(([x, h, w]) => { const px = X(x), py = CH - h; ctx.fillStyle = "#00000025"; ctx.fillRect(px + 3, py + 12, w, 3); const pg = ctx.createLinearGradient(0, py, 0, py + 12); pg.addColorStop(0, "#a3e635"); pg.addColorStop(0.35, "#65a30d"); pg.addColorStop(0.36, "#b45f1c"); pg.addColorStop(1, "#7c3a0e"); ctx.fillStyle = pg; rr(px, py, w, 12, 4); ctx.fill(); ctx.strokeStyle = "#3f2208"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = "#ffffff30"; ctx.fillRect(px + 3, py + 1.5, w - 6, 1.5); });
      s.blocos.forEach((q) => { const bx = X(q.x), by = q.y - (q.bump > 0 ? Math.sin((q.bump / 0.18) * Math.PI) * 5 : 0);
        if (q.k === "b") { ctx.fillStyle = "#00000030"; ctx.fillRect(bx + 2, CH - 2, 20, 3); const bg = ctx.createLinearGradient(0, by, 0, CH); bg.addColorStop(0, "#fbbf24"); bg.addColorStop(1, "#c2410c"); ctx.fillStyle = bg; rr(bx, by, q.w, q.h, 3); ctx.fill(); ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = "#ffffff55"; ctx.fillRect(bx + 2, by + 2, 14, 2); ctx.fillStyle = "#7c2d1260"; for (let y = by + 9; y < CH - 2; y += 9) ctx.fillRect(bx + 1, y, 16, 1); return; }
        const usado = q.usado, bg = ctx.createLinearGradient(0, by, 0, by + 16); if (q.k === "q" && !usado) { bg.addColorStop(0, "#fde047"); bg.addColorStop(1, "#d97706"); } else if (q.k === "q") { bg.addColorStop(0, "#a8a29e"); bg.addColorStop(1, "#78716c"); } else { bg.addColorStop(0, "#fb923c"); bg.addColorStop(1, "#9a3412"); }
        ctx.fillStyle = bg; rr(bx, by, 16, 16, 2.5); ctx.fill(); ctx.strokeStyle = "#451a03"; ctx.lineWidth = 1.3; ctx.stroke(); ctx.fillStyle = "#ffffff55"; ctx.fillRect(bx + 1.5, by + 1.5, 13, 1.5);
        if (q.k === "q" && !usado) { ctx.fillStyle = "#7c2d12"; ctx.font = "bold 11px system-ui"; ctx.textAlign = "center"; ctx.fillText("?", bx + 8, by + 12.5); ctx.textAlign = "left"; } else if (q.k === "t") { ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, by + 8); ctx.lineTo(bx + 16, by + 8); ctx.moveTo(bx + 8, by); ctx.lineTo(bx + 8, by + 8); ctx.moveTo(bx + 4, by + 8); ctx.lineTo(bx + 4, by + 16); ctx.moveTo(bx + 12, by + 8); ctx.lineTo(bx + 12, by + 16); ctx.stroke(); } });
      moedas.forEach((m, i) => { if (s.pegas.has(i)) return; const w = Math.max(1.4, Math.abs(Math.cos(t * 3.5 + i)) * 5.2), y = m.y + Math.sin(t * 3 + i) * 1.2; ctx.fillStyle = "#fde04733"; ctx.beginPath(); ctx.ellipse(X(m.x), y, w + 3, 9, 0, 0, 7); ctx.fill(); const cg = ctx.createLinearGradient(0, y - 6, 0, y + 6); cg.addColorStop(0, "#fff176"); cg.addColorStop(1, "#f59e0b"); ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(X(m.x), y, w, 6, 0, 0, 7); ctx.fill(); ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1; ctx.stroke(); if (w > 3) { ctx.fillStyle = "#fffbeb"; ctx.fillRect(X(m.x) - 0.6, y - 3, 1.2, 6); } });
      s.fx.forEach((f) => { const y = f.y - f.t * 40, w = Math.max(1.4, Math.abs(Math.cos(f.t * 14)) * 5); ctx.globalAlpha = 1 - f.t / 0.7; ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.ellipse(X(f.x), y, w, 6, 0, 0, 7); ctx.fill(); ctx.strokeStyle = "#b45309"; ctx.stroke(); ctx.globalAlpha = 1; });
      s.inimigos.forEach((e) => { if (!e.vivo) return; const x = X(e.x), y = CH - Math.abs(Math.sin(t * 8 + e.x0)) * 2; ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.ellipse(x, CH, 9, 2.5, 0, 0, 7); ctx.fill(); const eg = ctx.createLinearGradient(0, y - 15, 0, y); eg.addColorStop(0, "#fb7185"); eg.addColorStop(1, "#be123c"); ctx.fillStyle = eg; ctx.beginPath(); ctx.moveTo(x - 9, y - 2); ctx.quadraticCurveTo(x - 10, y - 17, x, y - 17); ctx.quadraticCurveTo(x + 10, y - 17, x + 9, y - 2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#4c0519"; ctx.lineWidth = 1.3; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x - 3.5, y - 9, 2.6, 3.2, 0, 0, 7); ctx.ellipse(x + 3.5, y - 9, 2.6, 3.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#111827"; ctx.beginPath(); ctx.arc(x - 3, y - 8.5, 1.2, 0, 7); ctx.arc(x + 4, y - 8.5, 1.2, 0, 7); ctx.fill(); ctx.strokeStyle = "#4c0519"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 6, y - 13); ctx.lineTo(x - 1.5, y - 11); ctx.moveTo(x + 6, y - 13); ctx.lineTo(x + 1.5, y - 11); ctx.stroke(); ctx.fillStyle = "#4c0519"; ctx.fillRect(x - 8, y - 2, 6, 2.5); ctx.fillRect(x + 2, y - 2, 6, 2.5); });
      s.morcegos.forEach((m) => { if (!m.vivo) return; const x = X(m.x), y = m.y, a = Math.sin(t * 16) * 6; ctx.fillStyle = "#00000022"; ctx.beginPath(); ctx.ellipse(x, CH, 6, 2, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#6d28d9"; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.quadraticCurveTo(x - 14, y - 8 - a, x - 18, y + 2 + a * 0.4); ctx.quadraticCurveTo(x - 10, y + 1, x - 4, y + 5); ctx.moveTo(x + 4, y); ctx.quadraticCurveTo(x + 14, y - 8 - a, x + 18, y + 2 + a * 0.4); ctx.quadraticCurveTo(x + 10, y + 1, x + 4, y + 5); ctx.fill(); const bg = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 8); bg.addColorStop(0, "#a78bfa"); bg.addColorStop(1, "#4c1d95"); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y + 1, 7, 0, 7); ctx.fill(); ctx.strokeStyle = "#2e1065"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = "#fde047"; ctx.fillRect(x - 4, y - 1, 3, 3); ctx.fillRect(x + 1, y - 1, 3, 3); ctx.fillStyle = "#fff"; ctx.fillRect(x - 2, y + 4, 1.5, 2); ctx.fillRect(x + 1, y + 4, 1.5, 2); });
      const fx = X(FIM); ctx.fillStyle = "#f1f5f9"; ctx.fillRect(fx, CH - 58, 3, 58); esfera(ctx, fx + 1.5, CH - 59, 3.5, "#fde047", "#b45309"); ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.moveTo(fx + 3, CH - 54); ctx.quadraticCurveTo(fx + 15, CH - 52 + Math.sin(t * 6) * 3, fx + 28, CH - 47 + Math.sin(t * 6 + 1) * 2); ctx.quadraticCurveTo(fx + 15, CH - 43 + Math.sin(t * 6) * 3, fx + 3, CH - 40); ctx.fill();
      if (!(s.inv > 0 && Math.floor(s.t * 14) % 2)) mini(ctx, b, X(s.x), s.y - (s.no && (s.k.dir || s.k.esq) ? Math.abs(Math.sin(t * 14)) * 1.8 : 0), 0.62, { espelho: !!ESPECIES[b.especie].olha && s.dir > 0 });
      ctx.fillStyle = "#0b1328cc"; rr(4, 4, 46, 18, 9); ctx.fill(); estrelaBonita(ctx, 15, 13, 6); ctx.fillStyle = "#fde047"; ctx.font = "bold 12px system-ui"; ctx.fillText(s.moedas, 26, 18);
      coracoesVida(ctx, s.vidas, 140);
      ctx.fillStyle = "#0b1328aa"; rr(58, 8, 74, 7, 3.5); ctx.fill(); ctx.fillStyle = "#22d3ee"; rr(58, 8, Math.max(7, 74 * Math.min(1, s.x / FIM)), 7, 3.5); ctx.fill();
    },
  };
}

/* ---------- 5) Conserta-tudo: um prédio grande, um gorila no telhado jogando tijolos. Use as setas e o martelo; pegue a torta para ganhar um coração ---------- */
function jogoConserta() {
  const X0 = 12, W = 42, Y0 = 42, H = 28, L = 5, C = 4, TEMPO = 75;
  const cx = (c) => X0 + W / 2 + c * W, cy = (r) => Y0 + H / 2 + r * H + 2;
  return {
    ctl: { dirs: ["esq", "dir", "cima", "baixo"], acao: "martelo" },
    tecla(s, k) {
      if (s.fim) return;
      if (k === "acao") { if (s.j[s.cel.r][s.cel.c] && !s.fixando && !s.alvo) { s.fixando = true; s.mart = 0.001; } else if (s.alvo && s.j[s.alvo.r][s.alvo.c]) s.alvo.auto = true; return; }
      const d = { esq: [0, -1], dir: [0, 1], cima: [-1, 0], baixo: [1, 0] }[k]; if (!d) return;
      const r = Math.max(0, Math.min(L - 1, s.cel.r + d[0])), c = Math.max(0, Math.min(C - 1, s.cel.c + d[1])); if (r === s.cel.r && c === s.cel.c) return;
      s.cel = { r, c }; s.alvo = { r, c, auto: false }; s.fixando = false; s.mart = 0; Som.efeito("toque");
    },
    iniciar: () => {
      const j = Array.from({ length: L }, () => Array(C).fill(0)), todas = []; for (let r = 0; r < L; r++) for (let c = 0; c < C; c++) todas.push([r, c]);
      todas.sort(() => Math.random() - 0.5).slice(0, 10).forEach(([r, c]) => (j[r][c] = 1));
      return { cx, cy, j, pos: { x: cx(1), y: cy(L - 1) }, cel: { r: L - 1, c: 1 }, fixando: false, alvo: null, mart: 0, tijolos: [], gor: { x: cx(0), c: 0, fase: "anda", t: 0 }, torta: null, proxTorta: 12, quebra: 5, tempo: TEMPO, vidas: 3, inv: 0, consertadas: 0, t: 0, fim: false, frac: 0 };
    },
    toque(s, x, y) {
      if (s.fim) return; const c = Math.floor((x - X0) / W), r = Math.floor((y - Y0) / H); if (c < 0 || c >= C || r < 0 || r >= L) return;
      s.alvo = { r, c, auto: true }; s.cel = { r, c }; s.fixando = false; s.mart = 0; Som.efeito("toque");
    },
    passo(s, dt) {
      s.t += dt; s.tempo -= dt; if (s.inv > 0) s.inv -= dt;
      if (s.alvo) {
        const tx = cx(s.alvo.c), ty = cy(s.alvo.r), dx = tx - s.pos.x, dy = ty - s.pos.y, d = Math.hypot(dx, dy);
        if (d > 2) { const k = Math.min(1, 105 * dt / d); s.pos.x += dx * k; s.pos.y += dy * k; }
        else { s.pos.x = tx; s.pos.y = ty; const auto = s.alvo.auto; s.alvo = null; if (auto && s.j[s.cel.r][s.cel.c]) { s.fixando = true; s.mart = 0.001; } }
      }
      if (s.fixando) { s.mart += dt; if (s.mart > 0.5) { s.fixando = false; s.mart = 0; if (s.j[s.cel.r][s.cel.c]) { s.j[s.cel.r][s.cel.c] = 0; s.consertadas++; Som.efeito("trinca"); setTimeout(() => Som.efeito("ping"), 120); } } }
      const g = s.gor;                                                                                   // o gorila anda pelo telhado e joga tijolos
      if (g.fase === "anda") { const alvo = cx(g.c), d = alvo - g.x, v = 46 * dt; if (Math.abs(d) <= v) { g.x = alvo; g.fase = "prepara"; g.t = 0.7; } else g.x += Math.sign(d) * v; }
      else if (g.fase === "prepara") { g.t -= dt; if (g.t <= 0) { s.tijolos.push({ x: g.x, y: Y0 - 6 }); Som.efeito("bola"); g.fase = "solta"; g.t = 0.35; } }
      else { g.t -= dt; if (g.t <= 0) { g.c = Math.floor(Math.random() * C); g.fase = "anda"; } }
      const vel = 118 + s.t * 1.3;
      s.tijolos.forEach((k) => { k.y += vel * dt; if (s.inv <= 0 && Math.abs(k.x - s.pos.x) < 11 && Math.abs(k.y - s.pos.y) < 13) { s.vidas--; s.inv = 1.3; k.y = 999; Som.efeito("erro"); } }); s.tijolos = s.tijolos.filter((k) => k.y < 192);
      s.quebra -= dt; if (s.quebra <= 0) { s.quebra = 4.5; const ok = []; s.j.forEach((l, r) => l.forEach((v, c) => { if (!v && !(s.cel.r === r && s.cel.c === c)) ok.push([r, c]); })); if (ok.length) { const [r, c] = ok[Math.floor(Math.random() * ok.length)]; s.j[r][c] = 1; } }
      s.proxTorta -= dt; if (s.proxTorta <= 0 && !s.torta) { s.proxTorta = 14; s.torta = { r: Math.floor(Math.random() * L), c: Math.floor(Math.random() * C), t: 7 }; }
      if (s.torta) { s.torta.t -= dt; if (s.torta.t <= 0) s.torta = null; else if (s.torta.r === s.cel.r && s.torta.c === s.cel.c && !s.alvo) { if (s.vidas < 3) s.vidas++; s.torta = null; Som.efeito("vitoria"); } }
      const faltam = s.j.flat().filter(Boolean).length;
      if (faltam === 0) { s.fim = true; s.frac = Math.max(0.55, 0.55 + 0.45 * (s.vidas / 3)); Som.efeito("vitoria"); }
      else if (s.vidas <= 0) { s.fim = true; s.frac = 0.12; }
      else if (s.tempo <= 0) { s.fim = true; s.frac = 0.15 + 0.4 * (s.consertadas / (s.consertadas + faltam)); }
    },
    desenhar(s, ctx, b) {
      const rr = (x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
      const g = ctx.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, "#15123f"); g.addColorStop(0.7, "#5b21b6"); g.addColorStop(1, "#7c3aed"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, 192);
      ctx.fillStyle = "#ffffffcc"; [[6, 30], [184, 22], [186, 100], [4, 120], [188, 60], [8, 76]].forEach(([x, y], i) => { ctx.globalAlpha = 0.5 + Math.sin(s.t * 3 + i) * 0.4; ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
      esfera(ctx, 176, 14, 7, "#fff7d6", "#f5d98b");
      const pr = ctx.createLinearGradient(X0 - 4, 0, X0 + W * C + 4, 0); pr.addColorStop(0, "#c2631c"); pr.addColorStop(0.5, "#e07a2a"); pr.addColorStop(1, "#9a4a14");
      ctx.fillStyle = "#1a0f08"; ctx.fillRect(X0 - 5, Y0 - 4, W * C + 10, H * L + 12); ctx.fillStyle = pr; ctx.fillRect(X0 - 3, Y0 - 2, W * C + 6, H * L + 9);
      ctx.fillStyle = "#7c3a0e55"; for (let y = Y0 - 2; y < Y0 + H * L + 7; y += 8) for (let x = X0 - 3; x < X0 + W * C + 3; x += 16) ctx.fillRect(x + ((y / 8) % 2) * 8, y, 15, 1);
      const te = ctx.createLinearGradient(0, Y0 - 14, 0, Y0 - 3); te.addColorStop(0, "#dc2626"); te.addColorStop(1, "#7f1d1d"); ctx.fillStyle = te; ctx.fillRect(X0 - 7, Y0 - 12, W * C + 14, 10); ctx.fillStyle = "#fca5a566"; ctx.fillRect(X0 - 7, Y0 - 12, W * C + 14, 2);
      for (let r = 0; r < L; r++) for (let c = 0; c < C; c++) {
        const x = X0 + c * W + 6, y = Y0 + r * H + 3, w = W - 12, h = H - 8, q = s.j[r][c];
        ctx.fillStyle = "#1a0f08"; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        const vg = ctx.createLinearGradient(0, y, 0, y + h);
        if (q) { vg.addColorStop(0, "#1e293b"); vg.addColorStop(1, "#0f172a"); } else { vg.addColorStop(0, "#fff3b0"); vg.addColorStop(1, "#f59e0b"); }
        ctx.fillStyle = vg; ctx.fillRect(x, y, w, h);
        if (!q) { const lz = ctx.createRadialGradient(x + w / 2, y + h / 2, 1, x + w / 2, y + h / 2, 24); lz.addColorStop(0, "#fde04755"); lz.addColorStop(1, "#fde04700"); ctx.fillStyle = lz; ctx.fillRect(x - 10, y - 8, w + 20, h + 16); ctx.fillStyle = "#1a0f08"; ctx.fillRect(x + w / 2 - 0.8, y, 1.6, h); ctx.fillRect(x, y + h / 2 - 0.8, w, 1.6); ctx.fillStyle = "#ffffff55"; ctx.fillRect(x + 2, y + 2, 4, h - 4); }
        else { ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.2; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(x + 3, y + 1); ctx.lineTo(x + 10, y + 8); ctx.lineTo(x + 6, y + 11); ctx.lineTo(x + 16, y + h - 1); ctx.moveTo(x + 10, y + 8); ctx.lineTo(x + w - 3, y + 4); ctx.moveTo(x + 10, y + 8); ctx.lineTo(x + 3, y + h - 3); ctx.stroke(); if (Math.floor(s.t * 3) % 2) { ctx.fillStyle = "#fb7185"; ctx.beginPath(); ctx.arc(x + w - 4, y + 3, 1.8, 0, 7); ctx.fill(); } }
        ctx.fillStyle = "#7c3a0e"; ctx.fillRect(x - 3, y + h, w + 6, 2.5); ctx.fillStyle = "#c8741f"; ctx.fillRect(x - 3, y + h, w + 6, 1);
        if (s.torta && s.torta.r === r && s.torta.c === c) { const bob = Math.sin(s.t * 6) * 1.2, px = x + w / 2, py = y + h - 3 + bob; ctx.fillStyle = "#fde68a"; ctx.beginPath(); ctx.ellipse(px, py, 8, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.ellipse(px, py - 2, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#dc2626"; ctx.beginPath(); ctx.arc(px, py - 5, 2.2, 0, 7); ctx.fill(); ctx.strokeStyle = "#92400e"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, py - 1, 8, 4.2, 0, 0, Math.PI * 2); ctx.stroke(); }
        if (s.cel.r === r && s.cel.c === c) { ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -s.t * 12; ctx.strokeRect(x - 3, y - 3, w + 6, h + 6); ctx.setLineDash([]); }
      }
      const ch = ctx.createLinearGradient(0, 180, 0, 192); ch.addColorStop(0, "#475569"); ch.addColorStop(1, "#1e293b"); ctx.fillStyle = ch; ctx.fillRect(0, 181, 192, 11);
      // o gorila no telhado
      const gr = s.gor, gx = gr.x, gy = Y0 - 12, brac = gr.fase === "prepara" ? -9 - Math.sin(s.t * 18) * 2 : gr.fase === "solta" ? 3 : Math.sin(s.t * 8) * 2;
      ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.ellipse(gx, gy + 11, 11, 2.5, 0, 0, 7); ctx.fill();
      const gg = ctx.createRadialGradient(gx - 3, gy - 6, 1, gx, gy, 13); gg.addColorStop(0, "#8b6b52"); gg.addColorStop(1, "#3b2a1e"); ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(gx, gy, 11, 11, 0, 0, 7); ctx.fill(); ctx.strokeStyle = "#1c120b"; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = "#4a3426"; ctx.beginPath(); ctx.ellipse(gx - 11, gy + 2 + brac, 4, 6, 0, 0, 7); ctx.ellipse(gx + 11, gy + 2 + brac, 4, 6, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d6b89a"; ctx.beginPath(); ctx.ellipse(gx, gy - 4, 7, 5.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#111827"; ctx.fillRect(gx - 4, gy - 6, 2, 2.4); ctx.fillRect(gx + 2, gy - 6, 2, 2.4); ctx.fillRect(gx - 2, gy - 2, 4, 1.4);
      if (gr.fase === "prepara") { const x = gx, p = 0.6 + Math.sin(s.t * 20) * 0.4; ctx.fillStyle = `rgba(251,113,133,${p})`; ctx.beginPath(); ctx.moveTo(x - 7, Y0 + 2); ctx.lineTo(x + 7, Y0 + 2); ctx.lineTo(x, Y0 + 14); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(x - 1, Y0 + 4, 2, 5); ctx.fillStyle = "#dc2626"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x - 6, gy - 22 + brac * 0.3, 12, 8, 2); else ctx.rect(x - 6, gy - 22, 12, 8); ctx.fill(); }
      s.tijolos.forEach((k) => { ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.ellipse(k.x, k.y + 8, 7, 2, 0, 0, 7); ctx.fill(); const bg = ctx.createLinearGradient(0, k.y - 5, 0, k.y + 5); bg.addColorStop(0, "#f87171"); bg.addColorStop(1, "#b91c1c"); ctx.fillStyle = bg; rr(k.x - 7, k.y - 5, 14, 10, 2); ctx.fill(); ctx.strokeStyle = "#450a0a"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = "#ffffff55"; ctx.fillRect(k.x - 5, k.y - 3, 8, 1.5); });
      if (!(s.inv > 0 && Math.floor(s.t * 14) % 2)) mini(ctx, b, s.pos.x, s.pos.y + 12, 0.44, {});
      if (s.fixando && s.mart > 0) { const sw = Math.sin(s.mart * 24); ctx.save(); ctx.translate(s.pos.x + 11, s.pos.y - 3); ctx.rotate(-0.7 + sw * 0.7); ctx.fillStyle = "#92400e"; ctx.fillRect(-1.5, -11, 3, 13); const hg = ctx.createLinearGradient(-5, -16, -5, -9); hg.addColorStop(0, "#e2e8f0"); hg.addColorStop(1, "#64748b"); ctx.fillStyle = hg; ctx.fillRect(-6, -16, 12, 7); ctx.restore(); }
      coracoesVida(ctx, s.vidas, 140);
      ctx.fillStyle = "#0b1328aa"; rr(6, 6, 70, 7, 3.5); ctx.fill(); ctx.fillStyle = s.tempo < 12 ? "#fb7185" : "#22d3ee"; rr(6, 6, Math.max(7, 70 * s.tempo / TEMPO), 7, 3.5); ctx.fill();
    },
  };
}

/* confete: pedacinhos coloridos caindo, só por uns instantes */
function confete(cv, n) {
  const caixa = cv.parentElement, W = (cv.width = caixa.clientWidth * 2), H = (cv.height = Math.max(caixa.clientHeight, 360) * 2), ctx = cv.getContext("2d");
  const cores = ["#fde047", "#fb7185", "#22d3ee", "#a78bfa", "#4ade80", "#fb923c", "#f472b6"];
  const ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: -Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 3, vy: 3 + Math.random() * 5, w: 8 + Math.random() * 10, h: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cores[(Math.random() * cores.length) | 0], f: Math.random() * 6 }));
  let t = 0;
  (function q() { if (!cv.isConnected) return; t++; ctx.clearRect(0, 0, W, H); let vivo = 0;
    ps.forEach((p) => { p.x += p.vx + Math.sin(t * 0.06 + p.f) * 1.2; p.y += p.vy; p.r += p.vr; p.vy = Math.min(p.vy + 0.04, 8); if (p.y < H + 20) vivo++; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.abs(Math.cos(p.r * 1.7)) * 0.8 + 0.2); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
    if (vivo) requestAnimationFrame(q); })();
}
