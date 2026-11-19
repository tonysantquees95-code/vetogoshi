"use strict";
/* ===== Bichix: bichinho virtual. O tempo segue o relógio real (ou 60x no modo teste). ===== */
const CHAVE = "vetogoshi.v1", CHAVE_ANTIGA = "bichix.v1";
const MAX_OFFLINE_MIN = 72 * 60;                      // ele "sente" até 3 dias de ausência
const FASE = [["Ovo", 0], ["Filhote", 3], ["Jovem", 6 * 60], ["Adulto", 24 * 60]];
const OVO_PASSOS = { comer: 2, limpar: 1, carinho: 3 };  // o que o ovo precisa para chocar

let mem = null;
const ler = () => { try { const t = localStorage.getItem(CHAVE) || localStorage.getItem(CHAVE_ANTIGA); if (t) return JSON.parse(t); } catch (e) {} return mem; };
const gravar = () => { mem = JSON.parse(JSON.stringify(estado)); try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {} };
const novoEstado = () => ({ moedas: 10, estrelas: 0, itens: [], sala: "quarto", bicho: null, reserva: [], tema: {}, avisos: false, cemiterio: [], rapido: false, som: true, ultimo: Date.now() });
let estado = (() => { const e = ler(); return e && typeof e === "object" ? Object.assign(novoEstado(), e) : novoEstado(); })();
const lim = (n) => Math.max(0, Math.min(100, n));
const ovoNovo = () => ({ comer: 0, limpar: 0, carinho: 0, rubs: 0 });
if (!Array.isArray(estado.reserva)) estado.reserva = [];
if (!estado.tema) estado.tema = {};
if (estado.bicho && !estado.bicho.look) estado.bicho.look = {};
if (estado.bicho && estado.bicho.sede === undefined) { estado.bicho.sede = 80; estado.bicho.vontade = 0; }
if (estado.bicho && estado.bicho.ovo === undefined) estado.bicho.ovo = estado.bicho.idade < FASE[1][1] ? ovoNovo() : null;   // bichinhos da versão anterior

function criarBicho(especie, nome) {
  return { especie, nome: nome.trim() || ESPECIES[especie].nome, idade: 0, ovo: ovoNovo(), look: {}, fome: 80, sede: 80, vontade: 0, tedio: 80, energia: 90, saude: 100, cocos: 0, dormindo: false, cuidado: 80, cocoTempo: 0, nasceu: Date.now(), vivo: true, causa: "" };
}
const fase = (b) => { if (b.ovo) return 0; let f = 1; FASE.forEach(([, m], i) => { if (i > 0 && b.idade >= m) f = i; }); return f; };
const passosOvo = (b) => Math.min(b.ovo.comer, 2) + Math.min(b.ovo.limpar, 1) + Math.min(b.ovo.carinho, 3);

/* ---------- simulação (dt em minutos do bichinho) ---------- */
function passo(b, dt) {
  if (!b || !b.vivo || b.ovo) return;                 // o ovo não passa fome: só espera ser cuidado
  const e = ESPECIES[b.especie];
  b.idade += dt;
  const protegido = b.idade < FASE[1][1] + 8;
  const k = b.dormindo ? 0.45 : 1;
  b.fome = lim(b.fome - 0.17 * e.fome * k * dt);
  b.sede = lim((b.sede ?? 80) - 0.21 * e.fome * k * dt);
  b.tedio = lim(b.tedio - 0.3 * e.tedio * k * dt);
  if (b.dormindo) { b.energia = lim(b.energia + 1.3 * dt); if (b.energia >= 100) b.dormindo = false; }
  else b.energia = lim(b.energia - 0.2 * e.sono * dt);
  b.vontade = Math.min(100, (b.vontade || 0) + dt * 1.1 * k);                            // sem ir ao banheiro, ele não aguenta e faz no chão
  if (b.vontade >= 100) { b.vontade = 0; if (b.cocos < 3) b.cocos++; }
  let dano = 0;
  if (b.fome <= 0) dano += 0.45;
  if (b.sede <= 0) dano += 0.5;
  if (b.energia <= 0) dano += 0.3;
  if (b.tedio <= 0) dano += 0.2;
  dano += b.cocos * 0.12;
  if (dano > 0 && !protegido) b.saude = lim(b.saude - dano * dt);
  else if (b.fome > 30 && b.sede > 30 && b.energia > 20 && b.tedio > 20 && b.cocos === 0) b.saude = lim(b.saude + 0.3 * dt);
  const media = (b.fome + b.sede + b.tedio + b.energia + b.saude) / 5;
  b.cuidado = lim(b.cuidado + (media - b.cuidado) * Math.min(1, dt / 240));
  if (b.saude <= 0) { b.vivo = false; b.saude = 0; b.dormindo = false; b.causa = b.fome <= 0 ? "fome" : b.sede <= 0 ? "sede" : b.energia <= 0 ? "cansaço" : b.cocos > 0 ? "sujeira" : "tristeza"; }
}
function avancar(b, dt) { let r = dt; while (r > 0 && b && b.vivo) { const p = Math.min(5, r); passo(b, p); r -= p; } }

/* ---------- utilidades ---------- */
const $ = (s) => document.querySelector(s);
const ICONES = {
  comer: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 3c-2 2-3 5-3 8h3v10"/>',
  brincar: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9c4 1 13 1 17 0M3.5 15c4-1 13-1 17 0M12 3c-2 3-2 15 0 18"/>',
  dormir: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  acordar: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  limpar: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  remedio: '<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/>',
  carinho: '<path d="M12 20s-8-4.6-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.4-8 10-8 10z"/>',
  basquete: '<path d="M5 5h14M7 5l2 7h6l2-7M10 12v3M14 12v3M12 12v4"/><circle cx="12" cy="19" r="2.5"/>',
  buscar: '<path d="M7.5 9 6 7.5a2.2 2.2 0 1 1 2.2-2.2L9.5 7M16.5 15l1.5 1.5a2.2 2.2 0 1 1-2.2 2.2L14.5 17M8.5 8.5l7 7"/>',
  estrelas: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  sede: '<path d="M6 4h12l-1.5 16h-9z"/><path d="M7.2 10h9.6"/>',
  banheiro: '<path d="M7 3h10v6H7zM5 9h14c0 5-3 8-7 8s-7-3-7-8zM9 17l-1 4M15 17l1 4"/>',
  cama: '<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/>',
  sofa: '<path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM6 18v2M18 18v2"/>',
  loja: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  sino: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/>', bichos: '<circle cx="7" cy="10" r="2"/>',
  repetir: '<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"/>', controle: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".6"/><circle cx="18" cy="13.5" r=".6"/>',
  setaesq: '<path d="M15 5l-7 7 7 7"/>', setadir: '<path d="M9 5l7 7-7 7"/>', setacima: '<path d="M5 15l7-7 7 7"/>', setabaixo: '<path d="M5 9l7 7 7-7"/>',
  pular: '<path d="M12 19V6M6 12l6-6 6 6"/>',
  martelo: '<path d="M13 5l6 6-3 3-6-6zM11.5 9.5L4 17l3 3 7.5-7.5"/>',
  cadeado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  somligado: '<path d="M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/>',
  somdesligado: '<path d="M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM3 3l18 18"/>',
};

/* ilustrações coloridas dos botões (a criança entende pelo desenho, sem ler) */
const ILUS = {
  comer: '<path d="M8 22a16 12 0 0 1 32 0z" fill="#f59e0b" stroke="#92400e" stroke-width="1.6"/><ellipse cx="18" cy="16" rx="1.8" ry="1" fill="#fde68a"/><ellipse cx="26" cy="13" rx="1.8" ry="1" fill="#fde68a"/><ellipse cx="32" cy="17" rx="1.8" ry="1" fill="#fde68a"/><path d="M7 24c3-2 5 2 8 0s5 2 8 0 5 2 8 0 5 2 8 0v3H7z" fill="#22c55e" stroke="#15803d" stroke-width="1.2"/><path d="M8 27h32v3l-3 3H11l-3-3z" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/><rect x="8" y="30" width="32" height="5" rx="2.5" fill="#7c2d12" stroke="#431407" stroke-width="1.2"/><path d="M8 36h32v1a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5z" fill="#f59e0b" stroke="#92400e" stroke-width="1.6"/>',
  brincar: '<circle cx="24" cy="24" r="17" fill="#fb923c" stroke="#7c2d12" stroke-width="2"/><path d="M24 7v34M7 24h34M12 11c6 5 6 21 0 26M36 11c-6 5-6 21 0 26" fill="none" stroke="#7c2d12" stroke-width="1.8"/><ellipse cx="17" cy="15" rx="4" ry="2.2" fill="#fff" opacity=".45"/>',
  dormir: '<path d="M33 8a16 16 0 1 0 8 26 13 13 0 0 1-8-26z" fill="#fde047" stroke="#b45309" stroke-width="1.8"/><path d="M30 10h8l-8 8h8M38 22h6l-6 6h6" fill="none" stroke="#93c5fd" stroke-width="2.4" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.6" fill="#fff"/><circle cx="8" cy="30" r="1.3" fill="#fff"/>',
  acordar: '<circle cx="24" cy="24" r="9" fill="#fde047" stroke="#d97706" stroke-width="2"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10 10l4 4M34 34l4 4M10 38l4-4M34 14l4-4" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>',
  limpar: '<path d="M8 14a16 10 0 0 1 32 0z" fill="#94a3b8" stroke="#475569" stroke-width="1.8"/><rect x="22" y="4" width="4" height="6" fill="#64748b"/><g fill="#38bdf8" stroke="#0369a1" stroke-width="1"><path d="M13 19c2 3 2 5 0 7-2-2-2-4 0-7zM21 21c2 3 2 5 0 7-2-2-2-4 0-7zM29 19c2 3 2 5 0 7-2-2-2-4 0-7zM37 21c2 3 2 5 0 7-2-2-2-4 0-7zM17 31c2 3 2 5 0 7-2-2-2-4 0-7zM25 33c2 3 2 5 0 7-2-2-2-4 0-7zM33 31c2 3 2 5 0 7-2-2-2-4 0-7z"/></g>',
  banheiro: '<rect x="13" y="5" width="22" height="13" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.8"/><rect x="31" y="3" width="6" height="3" rx="1.5" fill="#facc15"/><path d="M8 20h32c0 9-6 15-16 15S8 29 8 20z" fill="#fff" stroke="#64748b" stroke-width="2"/><ellipse cx="24" cy="21" rx="13" ry="3.5" fill="#bae6fd" stroke="#64748b" stroke-width="1.4"/><rect x="17" y="35" width="14" height="7" rx="2" fill="#e2e8f0" stroke="#64748b" stroke-width="1.6"/>',
  remedio: '<rect x="7" y="7" width="34" height="34" rx="9" fill="#fff" stroke="#fca5a5" stroke-width="2"/><path d="M19 12h10v7h7v10h-7v7H19v-7h-7V19h7z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.6" stroke-linejoin="round"/>',
  carinho: '<path d="M24 41S6 31 6 18a9.5 9.5 0 0 1 18-4 9.5 9.5 0 0 1 18 4c0 13-18 23-18 23z" fill="#fb7185" stroke="#be123c" stroke-width="2" stroke-linejoin="round"/><path d="M12 17a5 5 0 0 1 5-5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>',
  cama: '<rect x="5" y="12" width="5" height="26" rx="2" fill="#92400e"/><rect x="5" y="26" width="38" height="8" rx="3" fill="#ec4899" stroke="#9d174d" stroke-width="1.6"/><rect x="10" y="20" width="28" height="9" rx="4" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.6"/><ellipse cx="15" cy="22" rx="6" ry="4" fill="#fff" stroke="#94a3b8" stroke-width="1.4"/><rect x="38" y="30" width="5" height="9" rx="2" fill="#92400e"/>',
  cozinha: '<path d="M10 20h28v14a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" fill="#94a3b8" stroke="#475569" stroke-width="2"/><rect x="8" y="17" width="32" height="5" rx="2.5" fill="#cbd5e1" stroke="#475569" stroke-width="1.6"/><path d="M5 26h5M38 26h5" stroke="#475569" stroke-width="3" stroke-linecap="round"/><path d="M18 12c-3-3 3-4 0-7M26 12c-3-3 3-4 0-7M34 12c-3-3 3-4 0-7" fill="none" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round"/>',
  sala: '<rect x="9" y="10" width="30" height="14" rx="5" fill="#c084fc" stroke="#6b21a8" stroke-width="1.8"/><rect x="4" y="20" width="40" height="16" rx="6" fill="#a855f7" stroke="#6b21a8" stroke-width="1.8"/><rect x="11" y="22" width="12" height="9" rx="3" fill="#d8b4fe"/><rect x="25" y="22" width="12" height="9" rx="3" fill="#d8b4fe"/><rect x="9" y="36" width="4" height="5" rx="1.5" fill="#6b21a8"/><rect x="35" y="36" width="4" height="5" rx="1.5" fill="#6b21a8"/>',
  quarto: null, loja: '<path d="M9 17h30l-2.5 23H11.5z" fill="#fbbf24" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/><path d="M17 20v-6a7 7 0 0 1 14 0v6" fill="none" stroke="#b45309" stroke-width="2.4" stroke-linecap="round"/><path d="M24 24l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#fff7ae" stroke="#d97706" stroke-width="1.2" stroke-linejoin="round"/>',
};
ILUS.quarto = ILUS.cama;
const ilus = (n) => `<svg class="ilus" viewBox="0 0 48 48" aria-hidden="true">${ILUS[n] || ""}</svg>`;
const icone = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[n]}</svg>`;
let toastT = 0;
function aviso(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), 1800); }
function mostrar(tela) { for (const id of ["telaJogo", "telaEscolher", "telaTumulo"]) $("#" + id).hidden = id !== tela; }
const fmtIdade = (m) => m < 60 ? Math.floor(m) + " min" : m < 2880 ? Math.floor(m / 60) + " h" : Math.floor(m / 1440) + " dias";

/* ---------- cena principal ---------- */
let K = 2;
function ajustarCena() {
  const cv = $("#cv"), el = cv.parentElement, w = el.clientWidth || 390, h = el.clientHeight || 760;
  LARG = 224; ALT = Math.max(300, Math.min(520, Math.round(LARG * h / w)));
  K = Math.max(2, Math.min(4, Math.round(((window.devicePixelRatio || 1) * w) / LARG)));                 // resolução da tela: nítido em qualquer celular
  if (cv.width !== LARG * K || cv.height !== ALT * K) { cv.width = LARG * K; cv.height = ALT * K; }
  BASE = Math.round(ALT * 0.7); CHAO = BASE - 38;
}
window.addEventListener("resize", ajustarCena);
let cutucadas = 0, ultCutucada = 0;
const MUNDO = 448;                                     // o quarto é duas vezes mais largo que a tela: a câmera segue o bichinho
let posAntes = null, camX = 0, posX = 224, alvoX = 224, andando = false, dirAnd = 0;
let quadro = 0, cena = null, pulo = 0, particulas = [], caixa = null, ultimoToque = 0;
function iniciarCena(tipo, dur, fim, extra = {}) { cena = { tipo, t0: performance.now(), dur, fim, ...extra }; }
function corações(n, x, y) { for (let i = 0; i < n; i++) particulas.push({ x: x + (Math.random() - 0.5) * 44, y: y - 10, vy: -0.7 - Math.random() * 0.7, vida: 46 + Math.random() * 16, v0: 62, r: 7 + Math.random() * 4, ph: Math.random() * 6 }); }
function cenaDaSala(ctx, b, t) {
  const sala = b.ovo ? "quarto" : estado.sala, sc = CENAS[sala];
  if (sc) sc(ctx, t, MUNDO, ALT, CHAO); else cenaQuarto(ctx, b.dormindo, t, MUNDO);
  aplicarTema(ctx, sala, MUNDO, ALT, CHAO);
  ITENS.forEach((i) => { if (i.tipo === "casa" && i.sala === sala && estado.itens.includes(i.id) && !(b.dormindo && i.id === "cama-pet")) DECOR[i.id](ctx, MUNDO, CHAO, t); });
  if (b.dormindo && sala === "quarto") camaDormir(ctx, CAMA_X, CHAO + 38);
}
function necessidade(b) {
  if (b.dormindo) return null;
  if (b.saude < 40) return "cruz";
  if (b.fome < 30) return "comida";
  if (b.sede < 30) return "copo";
  if (b.vontade >= 70) return "privada";
  if (b.cocos > 0) return "gota";
  if (b.energia < 25) return "lua";
  if (b.tedio < 30) return "bola";
  return null;
}
function resumo(b) { return !b.vivo ? "Descansou" : b.ovo ? "Ovo: cuide para chocar" : b.dormindo ? "Dormindo" : ({ cruz: "Está doente", comida: "Está com fome", copo: "Está com sede", privada: "Quer ir ao banheiro", gota: "Quer um banho", lua: "Está cansado", bola: "Quer brincar" })[necessidade(b)] || "Está bem"; }

function trincas(ctx, x, y, w, h, n) {
  ctx.strokeStyle = "#5b6478"; ctx.lineWidth = 3; ctx.lineJoin = "miter";
  const c = (pts) => { ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(x + a * w, y + b * h) : ctx.moveTo(x + a * w, y + b * h))); ctx.stroke(); };
  if (n >= 2) c([[0.5, 0.18], [0.44, 0.28], [0.54, 0.36], [0.47, 0.46]]);
  if (n >= 4) c([[0.47, 0.46], [0.36, 0.52], [0.42, 0.62], [0.3, 0.7]]);
  if (n >= 5) c([[0.54, 0.36], [0.66, 0.4], [0.62, 0.52], [0.74, 0.58]]);
}
function pintarCena() {
  const cv = $("#cv"); if (!cv || $("#telaJogo").hidden) return;
  const b = estado.bicho; if (!b) return;
  if (cv.height !== ALT * K || cv.width !== LARG * K) ajustarCena();
  const ctx = cv.getContext("2d"); ctx.setTransform(K, 0, 0, K, 0, 0); ctx.imageSmoothingEnabled = false; RESOL = K;
  quadro++;
  const agora = performance.now(), t = quadro, CX = LARG / 2;
  const c = cena, u = c ? Math.min(1, (agora - c.t0) / c.dur) : 0;
  if (!b.vivo) return;
  const f = fase(b), esc = [3, 2, 3, 4][f];
  const banho = !!(c && (c.tipo === "banho" || c.tipo === "privada"));
  if (banho) { if (posAntes === null) posAntes = posX; posX = alvoX = LARG / 2; camX = 0; }
  else { if (posAntes !== null) { posX = alvoX = posAntes; posAntes = null; camX = Math.max(0, Math.min(MUNDO - LARG, posX - LARG / 2)); } camX += (Math.max(0, Math.min(MUNDO - LARG, (f === 0 ? MUNDO / 2 : posX) - LARG / 2)) - camX) * 0.18; }
  ctx.save(); ctx.translate(-Math.round(camX), 0);
  if (c && c.tipo === "privada") cenaPrivada(ctx, t, LARG, ALT, CHAO); else if (banho) cenaBanho(ctx, t); else cenaDaSala(ctx, b, t);
  const base = BASE, bob = b.dormindo ? 0 : Math.floor(t / 7) % 2, hop = pulo > 0 ? Math.sin((pulo / 14) * Math.PI) * 24 : 0;
  if (pulo > 0) pulo--;
  let area;
  if (f === 0) {                                          // ===== o ovo =====
    const CXO = MUNDO / 2, passos = passosOvo(b), balanca = (c && c.tipo === "chocar") ? Math.sin(t * 1.6) * (3 + u * 8) : (passos >= 5 ? Math.sin(t * 0.9) * 2 : 0);
    const fnO = fnPara(esc), im = imagemOvo(fnO), S = (esc * 4) / fnO, w = im.width * S, h = im.height * S, x = Math.round(CXO - w / 2 + balanca), y = base - h + im.pad * S - hop * 0.5;
    if (!(c && c.tipo === "chocar" && u > 0.78)) { ctx.drawImage(im, x, y, w, h); trincas(ctx, x, y, w, h, c && c.tipo === "chocar" ? 5 : passos); area = { x, y, w, h }; }
    else { const k = (u - 0.78) / 0.22; pintarCascas(ctx, x, y, w, h, k); desenharBicho(ctx, b.especie, CXO, base, 2, {}); ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 0.9 - k)})`; ctx.fillRect(camX, 0, LARG, ALT); }
    for (let i = 0; i < 6; i++) { const hx = CXO - 45 + i * 15; coracaoBonito(ctx, hx + 7, base + 23, 7, 1, 0, i < passos ? 1 : 0); }
    if (!c) { const falta = ["comida", "gota", "coracao"].filter((n, i) => [b.ovo.comer < 2, b.ovo.limpar < 1, b.ovo.carinho < 3][i]); if (falta.length) balao(ctx, falta[Math.floor(t / 28) % falta.length], CXO, y - 4); }
    if (c && c.tipo === "comer") pix(ctx, "comida", CXO - 18, y - 40 + u * 70, 5);
  } else if (b.dormindo && estado.sala !== "quarto" && !c) {      // ele está dormindo na caminha, lá no quarto
    area = null; ctx.fillStyle = "#0b1328cc"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(camX + LARG / 2 - 78, BASE - 70, 156, 40, 20) : ctx.rect(camX + LARG / 2 - 78, BASE - 70, 156, 40); ctx.fill();
    ctx.fillStyle = "#e0f2fe"; ctx.font = "bold 15px system-ui"; ctx.textAlign = "center"; ctx.fillText("Dormindo no quarto", camX + LARG / 2 + 8, BASE - 45); ctx.textAlign = "left"; pix(ctx, "lua", camX + LARG / 2 - 66, BASE - 62, 3);
  } else {                                                // ===== o bichinho =====
    const priv = !!(c && c.tipo === "privada"), escV = priv ? esc * 0.62 : esc, baseV = base - (priv ? 18 : 0) - (b.dormindo ? 30 : 0);
    const pelado = f === 3 && b.cuidado < 40, piscar = !b.dormindo && t % 70 < 3;
    let ex = 0;
    if (b.dormindo && !c) { posX = alvoX = CAMA_X; andando = false; }
    else if (b.dormindo || (c && !banho)) { alvoX = posX; andando = false; }
    else { const dx = alvoX - posX; if (Math.abs(dx) > 2.5) { posX += Math.sign(dx) * Math.min(Math.abs(dx), 3.4); andando = true; dirAnd = Math.sign(dx); } else { andando = false; } }
    if (c && c.tipo === "comer") { ex = Math.sin(u * 20) * 2; pix(ctx, c.prato || "comida", posX + 52 - u * 40, base - 70 + Math.abs(Math.sin(u * 14)) * 6, 5); }
    const passo = andando ? Math.floor(t / 3) % 2 : bob;
    area = desenharBicho(ctx, b.especie, posX + ex + (priv && u < 0.6 ? Math.sin(t * 2.4) * 1.3 : 0), baseV - passo * 3 - hop, escV, { fechado: b.dormindo || piscar || (c && c.tipo === "banho"), cinza: pelado, tinta: tintaDe(b), espelho: ESPECIES[b.especie].olha && dirAnd > 0 }); vestir(ctx, b, area); if (b.dormindo) cobertor(ctx, area, t);
    if (f === 3 && b.cuidado >= 70 && !b.dormindo) pix(ctx, "estrela", area.x + area.w - 16, area.y + 8, 3);
    if (priv) privadaFrente(ctx, t, LARG, BASE - 6, u);
    if (c && c.tipo === "banho") { ctx.fillStyle = "#ffffff"; [[-34, 12, 8], [-8, -4, 10], [24, 6, 9], [42, 28, 7], [-28, 40, 7]].forEach(([dx, dy, r], i) => { ctx.beginPath(); ctx.arc(posX + dx, area.y + 20 + dy + Math.sin(t / 6 + i) * 2, r, 0, 7); ctx.fill(); }); }
    const nec = necessidade(b);
    if (nec && !c) { const alto = area.y < 100; balao(ctx, nec, alto ? posX + 60 : posX, alto ? area.y + 56 : area.y - 2); }
    if (b.dormindo) { ctx.fillStyle = "#e0f2fe"; const z = Math.floor(t / 10) % 3; for (let i = 0; i <= z; i++) { const zx = posX + 36 + i * 12, zy = area.y + 24 - i * 12; ctx.fillRect(zx, zy, 8, 2); ctx.fillRect(zx + 6, zy + 2, 2, 2); ctx.fillRect(zx + 4, zy + 4, 2, 2); ctx.fillRect(zx + 2, zy + 6, 2, 2); ctx.fillRect(zx, zy + 8, 8, 2); } }
    for (let i = 0; i < b.cocos; i++) { const cxp = MUNDO / 2 - 110 + i * 26, cyp = base - 24; ctx.fillStyle = "#0b1328"; ctx.fillRect(cxp - 2, cyp - 2, 24, 24); ctx.fillStyle = "#a16207"; ctx.fillRect(cxp, cyp + 9, 20, 11); ctx.fillRect(cxp + 4, cyp + 2, 12, 9); ctx.fillRect(cxp + 8, cyp - 1, 4, 4); ctx.fillStyle = "#fde68a"; ctx.fillRect(cxp + 4, cyp + 11, 3, 2); }
    if (b.dormindo) { ctx.fillStyle = "#0008"; ctx.fillRect(camX, 0, LARG, ALT); }
  }
  caixa = area;
  particulas = particulas.filter((p) => p.vida > 0);
  particulas.forEach((p) => { p.y += p.vy; p.vida--; const k = Math.min(1, p.vida / 18), e = Math.min(1, (p.v0 - p.vida) / 8), sw = Math.sin(p.vida * 0.18 + p.ph); coracaoBonito(ctx, p.x + sw * 5, p.y, p.r * (0.5 + 0.5 * e) * (1 + (1 - k) * 0.2), k, sw * 0.3); });
  ctx.restore();
  if (c && u >= 1) { cena = null; c.fim && c.fim(); }
}
function pintarCascas(ctx, x, y, w, h, k) {
  ctx.fillStyle = "#e9edf5"; ctx.strokeStyle = "#9aa4b8";
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, bb], i) => { const px = x + w / 2 + a * (14 + k * 50), py = y + h / 2 + bb * (10 + k * 40) - k * 20 + k * k * 60; ctx.save(); ctx.translate(px, py); ctx.rotate(a * k * 1.4); ctx.fillRect(-12, -9, 24, 18); ctx.strokeRect(-12, -9, 24, 18); ctx.restore(); });
}

/* ---------- textos, barras e botões ---------- */
const corBarra = (v) => (v > 55 ? "var(--ok)" : v > 25 ? "var(--aviso)" : "var(--ruim)");
function barras(b) {
  const itens = b.ovo ? [] : [["Fome", b.fome, "comer"], ["Sede", b.sede, "sede"], ["Diversão", b.tedio, "brincar"], ["Energia", b.energia, "dormir"], ["Banheiro", 100 - (b.vontade || 0), "banheiro"], ["Saúde", b.saude, "remedio"]];
  $("#barras").hidden = !itens.length;
  $("#barras").innerHTML = itens.map(([n, v, i]) => `<div class="barra"><span class="rotulo">${icone(i)}<span>${n}</span></span><div class="trilho" role="progressbar" aria-label="${n}" aria-valuenow="${Math.round(v)}" aria-valuemin="0" aria-valuemax="100"><div class="preench" style="width:${Math.round(v)}%;background:${corBarra(v)}"></div></div></div>`).join("");
}
function botoes(b) {
  const ovo = !!b.ovo, bloq = !!cena;
  const lista = [["comer", "Comer"], ["brincar", "Brincar"], [b.dormindo ? "acordar" : "dormir", b.dormindo ? "Acordar" : "Dormir"], ["limpar", "Banho"], ["banheiro", "Banheiro"], ["remedio", "Remédio"], ["carinho", "Carinho"]];
  pintarSalas(b);
  $("#acoes").innerHTML = lista.map(([i, t]) => {
    const fora = ovo && !["comer", "limpar", "carinho"].includes(i);
    const alerta = !ovo && (((i === "comer") && (b.fome < 25 || b.sede < 25)) || (i === "banheiro" && b.vontade >= 70) || (i === "limpar" && b.cocos > 0) || (i === "remedio" && b.saude < 40) || (i === "dormir" && b.energia < 20) || (i === "brincar" && b.tedio < 25));
    return `<button class="acao${alerta ? " alerta" : ""}" data-a="${i}" aria-label="${t}" ${fora || bloq ? "disabled" : ""}><span class="bolha b-${i}">${ilus(i)}</span><span>${t}</span></button>`;
  }).join("");
}
function pintarSalas(b) {
  const nav = $("#salas"); nav.hidden = !!b.ovo || !b.vivo; if (nav.hidden) return;
  nav.innerHTML = SALAS.map(([id, nome, ic]) => `<button class="sala-btn${estado.sala === id ? " ativa" : ""}" data-sala="${id}" aria-label="${nome}" aria-pressed="${estado.sala === id}">${ilus(id)}<span class="rot">${nome}</span></button>`).join("") + `<button class="sala-btn loja" id="btnLoja" aria-label="Lojinha, ${estado.moedas} moedas">${ilus("loja")}<span class="rot">Loja</span><span class="moedas">${estado.moedas}</span></button>`;
  nav.querySelectorAll("[data-sala]").forEach((x) => x.addEventListener("click", () => { if (cena) return; estado.sala = x.dataset.sala; Som.efeito("toque"); gravar(); pintarSalas(estado.bicho); }));
  $("#btnLoja").addEventListener("click", () => { Som.desbloquear(); abrirLoja("casa"); });
}
const nomeSala = (id) => (SALAS.find((x) => x[0] === id) || [])[1];
function abrirLoja(aba) {
  const b = estado.bicho; if (!b) return; b.look = b.look || {};
  const ABAS = [["casa", "Casa"], ["roupa", "Roupas"], ["cor", "Cores"], ["tema", "Paredes"]];
  const lista = ITENS.filter((i) => (aba === "casa" ? i.tipo === "casa" : aba === "roupa" ? ["chapeu", "oculos", "peruca", "pescoco"].includes(i.tipo) : aba === "tema" ? i.tipo === "parede" || i.tipo === "piso" : i.tipo === "cor"));
  const tem = (i) => estado.itens.includes(i.id);
  const reqOk = (i) => !i.req || ((!i.req.fase || fase(b) >= i.req.fase) && (!i.req.estrelas || (estado.estrelas || 0) >= i.req.estrelas));
  const reqTxt = (i) => (i.req.fase ? FASE[i.req.fase][0] : `${i.req.estrelas} estrelas`);
  const cartao = (i) => {
    const usando = i.tipo === "parede" || i.tipo === "piso" ? ((estado.tema[estado.sala] || {})[i.tipo] === i.id) : i.tipo !== "casa" && b.look[i.tipo] === i.id, bloq = !tem(i) && !reqOk(i);
    const prev = `<span class="prev" data-p="${i.id}"></span>`;
    const baixoTxt = (i.tipo === "parede" || i.tipo === "piso") ? (usando ? "Usando" : "Usar") : null;
    const baixo = bloq ? `<small class="trava">${icone("cadeado")}${reqTxt(i)}</small>` : tem(i) ? `<small class="tem">${i.tipo === "casa" ? "Na " + nomeSala(i.sala).toLowerCase() : usando ? "Usando" : "Usar"}</small>` : `<small class="preco"><i class="moeda"></i>${i.preco}</small>`;
    return `<button class="cartao item${usando ? " em-uso" : ""}${bloq ? " bloq" : ""}" data-i="${i.id}" aria-label="${i.nome}">${prev}<span class="nome">${i.nome}</span>${baixo}</button>`;
  };
  const normal = aba === "cor" ? `<button class="cartao item${b.look.cor ? "" : " em-uso"}" data-i="__normal" aria-label="Cor normal"><span class="prev" data-p="__normal"></span><span class="nome">Cor normal</span><small class="tem">${b.look.cor ? "Usar" : "Usando"}</small></button>` : aba === "tema" ? ["parede", "piso"].map((t) => { const u = !(estado.tema[estado.sala] || {})[t]; return `<button class="cartao item${u ? " em-uso" : ""}" data-i="__p_${t}" aria-label="${t === "parede" ? "Parede" : "Piso"} normal"><span class="prev" data-p="__p_${t}"></span><span class="nome">${t === "parede" ? "Parede" : "Piso"} normal</span><small class="tem">${u ? "Usando" : "Usar"}</small></button>`; }).join("") : "";
  folha("Lojinha", `<div class="loja-topo"><div class="abas">${ABAS.map(([id, n]) => `<button class="aba${id === aba ? " ativa" : ""}" data-aba="${id}">${n}</button>`).join("")}</div><span class="saldo">${icone("estrelas")} ${estado.moedas}</span></div><div class="jogos itens">${normal}${lista.map(cartao).join("")}</div><p class="dica">${aba === "tema" ? `Cores valem para: ${nomeSala(estado.sala)}. Troque de cômodo e volte aqui para pintar os outros.` : "Ganhe moedas nos joguinhos."}</p>`, (el) => {
    el.querySelectorAll("[data-p]").forEach((m) => m.appendChild(m.dataset.p === "__normal" ? previaPet(b, {}) : m.dataset.p.startsWith("__p_") ? previaTema({ id: m.dataset.p, tipo: "x" }) : previaItem(ITENS.find((q) => q.id === m.dataset.p), b)));
    el.querySelectorAll("[data-aba]").forEach((x) => x.addEventListener("click", () => abrirLoja(x.dataset.aba)));
    el.querySelectorAll("[data-i]").forEach((x) => x.addEventListener("click", () => {
      if (x.dataset.i === "__normal") { delete b.look.cor; gravar(); return abrirLoja(aba); }
      if (x.dataset.i.startsWith("__p_")) { const t = estado.tema[estado.sala] || (estado.tema[estado.sala] = {}); delete t[x.dataset.i.slice(4)]; Som.efeito("toque"); gravar(); return abrirLoja(aba); }
      const i = ITENS.find((q) => q.id === x.dataset.i);
      if (!tem(i)) {
        if (!reqOk(i)) return aviso(reqTxt(i) + ".");
        if (estado.moedas < i.preco) return aviso("Faltam moedas. Jogue para ganhar!");
        estado.moedas -= i.preco; estado.itens.push(i.id); Som.efeito("ping");
        if (i.tipo === "casa") { estado.sala = i.sala; aviso(`Colocado na ${nomeSala(i.sala).toLowerCase()}!`); } else if (i.tipo === "parede" || i.tipo === "piso") (estado.tema[estado.sala] || (estado.tema[estado.sala] = {}))[i.tipo] = i.id; else b.look[i.tipo] = i.id;
      } else if (i.tipo === "parede" || i.tipo === "piso") { const t = estado.tema[estado.sala] || (estado.tema[estado.sala] = {}); if (t[i.tipo] === i.id) delete t[i.tipo]; else t[i.tipo] = i.id; Som.efeito("toque"); }
      else if (i.tipo !== "casa") { if (b.look[i.tipo] === i.id) delete b.look[i.tipo]; else b.look[i.tipo] = i.id; Som.efeito("toque"); }
      gravar(); pintarSalas(b); abrirLoja(aba);
    }));
  });
}
function atualizar() {
  const b = estado.bicho; if (!b) return;
  $("#nomeBicho").textContent = b.nome;
  $("#faseBicho").textContent = (b.vivo ? FASE[fase(b)][0] : "Descansou") + " · " + ESPECIES[b.especie].nome;
  $("#idadeBicho").textContent = b.ovo ? "" : fmtIdade(b.idade);
  $("#fala").textContent = resumo(b);
  barras(b); botoes(b);
}

/* ---------- ações ---------- */
function folha(titulo, html, aoAbrir) {
  $("#folha").classList.remove("cheio");
  $("#folhaTitulo").textContent = titulo; $("#folhaCorpo").innerHTML = html; $("#folhaFundo").hidden = false;
  if (aoAbrir) aoAbrir($("#folhaCorpo"));
}
function fechar() { $("#folhaFundo").hidden = true; if (typeof pararJogo === "function") pararJogo(); }
const ocupado = (b) => { if (b.dormindo) { aviso("Ele está dormindo."); return true; } return false; };
function conferirOvo(b) {
  if (!b.ovo || passosOvo(b) < 6) return;
  Som.efeito("trinca");
  iniciarCena("chocar", 2000, () => { b.ovo = null; b.idade = FASE[1][1]; Som.efeito("chocar"); setTimeout(() => Som.voz(b.especie), 500); corações(8, posX, BASE - 90); pulo = 14; gravar(); atualizar(); aviso("Nasceu!"); });
  atualizar();
}
function acao(a) {
  const b = estado.bicho; if (!b || !b.vivo || cena) return;
  Som.desbloquear();
  if (b.ovo) {                                          // ovo: comer, banho e carinho
    if (a === "comer") { if (b.ovo.comer >= 2) return aviso("O ovo já comeu bastante."); Som.efeito("comer"); iniciarCena("comer", 1100, () => { b.ovo.comer++; Som.efeito("ping"); gravar(); atualizar(); conferirOvo(b); }); }
    else if (a === "limpar") { if (b.ovo.limpar >= 1) return aviso("O ovo já está limpinho."); Som.efeito("banho"); iniciarCena("banho", 2600, () => { b.ovo.limpar++; Som.efeito("ping"); gravar(); atualizar(); conferirOvo(b); }); }
    else if (a === "carinho") { if (b.ovo.carinho >= 3) return aviso("O ovo já sentiu seu carinho."); b.ovo.carinho++; Som.efeito("ping"); corações(3, posX, BASE - 90); pulo = 10; gravar(); atualizar(); conferirOvo(b); }
    atualizar(); return;
  }
  if (a === "dormir") { if (b.energia > 85) return aviso("Ele não está com sono."); estado.sala = "quarto"; b.dormindo = true; posX = alvoX = CAMA_X; Som.efeito("dormir"); }
  else if (a === "acordar") { b.dormindo = false; Som.voz(b.especie); pulo = 10; }
  else if (a === "limpar") { if (ocupado(b)) return; Som.efeito("banho"); iniciarCena("banho", 3000, () => { b.cocos = 0; b.cuidado = lim(b.cuidado + 4); b.tedio = lim(b.tedio + 6); Som.voz(b.especie); corações(5, posX, BASE - 90); pulo = 14; gravar(); atualizar(); }); }
  else if (a === "banheiro") { if (ocupado(b)) return; if ((b.vontade || 0) < 25) return aviso("Ele ainda não precisa ir ao banheiro."); Som.efeito("banho"); iniciarCena("privada", 2400, () => { b.vontade = 0; b.cuidado = lim(b.cuidado + 3); b.tedio = lim(b.tedio + 3); Som.efeito("ping"); Som.voz(b.especie); corações(4, posX, BASE - 90); pulo = 12; gravar(); atualizar(); }); }
  else if (a === "remedio") { if (ocupado(b)) return; if (b.saude > 70) return aviso("Ele está saudável."); b.saude = lim(b.saude + 30); Som.efeito("remedio"); corações(3, posX, BASE - 90); }
  else if (a === "carinho") { if (ocupado(b)) return; b.tedio = lim(b.tedio + 6); Som.voz(b.especie); corações(4, posX, BASE - 90); pulo = 12; }
  else if (a === "comer") { if (ocupado(b)) return; return menuComer(); }
  else if (a === "brincar") { if (ocupado(b)) return; if (b.energia < 10) return aviso("Ele está cansado."); return abrirJogos(); }
  gravar(); atualizar();
}
const CARDAPIO = [
  { id: "prato", nome: "Refeição", fome: 40, sede: -4, tedio: 0, saude: 0, vontade: 8 },
  { id: "lanche", nome: "Lanche", fome: 22, sede: -4, tedio: 8, saude: -2, vontade: 6 },
  { id: "doce", nome: "Doce", fome: 12, sede: -8, tedio: 18, saude: -5, vontade: 3 },
  { id: "comida", nome: "Fruta", fome: 14, sede: 10, tedio: 2, saude: 4, vontade: 4 },
  { id: "copo", nome: "Suco", fome: 6, sede: 38, tedio: 4, saude: 1, vontade: 14 },
  { id: "lata", nome: "Refrigerante", fome: 2, sede: 30, tedio: 14, saude: -5, vontade: 16 },
];
function menuComer() {
  folha("O que ele vai querer?", `<div class="jogos">${CARDAPIO.map((c) => `<button class="cartao" data-c="${c.id}" aria-label="${c.nome}"><span class="miniPix" data-p="${c.id}"></span><span class="nome">${c.nome}</span></button>`).join("")}</div>`,
    (el) => {
      el.querySelectorAll(".miniPix").forEach((m) => m.appendChild(imagemPix(m.dataset.p)));
      el.querySelectorAll("[data-c]").forEach((x) => x.addEventListener("click", () => {
        const b = estado.bicho, it = CARDAPIO.find((c) => c.id === x.dataset.c), bebida = it.sede > it.fome; fechar(); estado.sala = "cozinha";
        if (bebida ? b.sede > 92 : b.fome > 92) { aviso(bebida ? "Ele está sem sede. Beber demais faz mal!" : "Ele está sem fome. Comer demais faz mal!"); b.saude = lim(b.saude - 4); gravar(); atualizar(); return; }
        Som.efeito("comer");
        iniciarCena("comer", 1300, () => {
          b.fome = lim(b.fome + it.fome); b.sede = lim(b.sede + it.sede); b.tedio = lim(b.tedio + it.tedio); b.saude = lim(b.saude + it.saude); b.vontade = Math.min(100, (b.vontade || 0) + it.vontade);
          Som.voz(b.especie); corações(3, posX, BASE - 90); pulo = 10; gravar(); atualizar();
        }, { prato: it.id }); atualizar();
      }));
    });
}
/* mexer no bichinho: toque no chão para ele andar até lá, arraste-o para o lado, ou toque nele para ouvir a voz. O ovo só aceita carinho. */
let arrasto = null;
const ponto = (e) => { const r = $("#cv").getBoundingClientRect(); return [((e.clientX - r.left) * LARG) / r.width + camX, ((e.clientY - r.top) * ALT) / r.height]; };
const limitarX = (x) => { const m = (caixa ? caixa.w : 100) / 2 + 4; return Math.max(m, Math.min(MUNDO - m, x)); };
const noBicho = (x, y) => caixa && x >= caixa.x - 6 && x <= caixa.x + caixa.w + 6 && y >= caixa.y - 6 && y <= caixa.y + caixa.h + 6;
$("#cv").addEventListener("pointerdown", (e) => {
  const b = estado.bicho; if (!b || !b.vivo || cena) return;
  Som.desbloquear();
  const [x, y] = ponto(e);
  if (b.ovo) {
    if (!noBicho(x, y)) return;
    const agora = performance.now(); if (agora - ultimoToque < 250) return; ultimoToque = agora;
    b.ovo.rubs++; pulo = 8; Som.efeito("toque"); corações(1, x, y);
    if (b.ovo.rubs % 4 === 0 && b.ovo.carinho < 3) { b.ovo.carinho++; Som.efeito("ping"); gravar(); atualizar(); conferirOvo(b); }
    return;
  }
  if (b.dormindo) {
    if (noBicho(x, y)) {
      const ag = performance.now(); if (ag - ultCutucada > 2500) cutucadas = 0; ultCutucada = ag; cutucadas++; pulo = 6; Som.efeito("toque");
      if (cutucadas >= 3) { cutucadas = 0; b.dormindo = false; Som.voz(b.especie); pulo = 12; corações(4, posX, BASE - 90); gravar(); atualizar(); }
      else aviso(cutucadas === 1 ? "Mmm... ele se mexeu." : "Está quase acordando...");
    }
    return;
  }
  if (noBicho(x, y)) { arrasto = { x0: x, mov: false }; try { $("#cv").setPointerCapture(e.pointerId); } catch (err) {} }
  else { alvoX = limitarX(x); }
});
$("#cv").addEventListener("pointermove", (e) => {
  if (!arrasto || cena) return;
  const [x] = ponto(e);
  if (!arrasto.mov && Math.abs(x - arrasto.x0) > 8) arrasto.mov = true;
  if (arrasto.mov) { posX = alvoX = limitarX(x); }
});
const soltar = (e) => {
  if (!arrasto) return; const a = arrasto; arrasto = null;
  const b = estado.bicho; if (a.mov || !b || !b.vivo || cena) return;
  const agora = performance.now(); if (agora - ultimoToque < 250) return; ultimoToque = agora;
  const [x, y] = ponto(e);
  Som.voz(b.especie); pulo = 14; corações(3, x, y); b.tedio = lim(b.tedio + 1.5); gravar();
};
$("#cv").addEventListener("pointerup", soltar); $("#cv").addEventListener("pointercancel", () => { arrasto = null; });

/* ---------- telas ---------- */
let escolhida = "gato", adicionando = false;
function telaEscolher() {
  mostrar("telaEscolher");
  $("#especies").innerHTML = Object.entries(ESPECIES).map(([id, e]) => `<button class="especie" data-e="${id}" aria-pressed="${id === escolhida}"><canvas width="72" height="72" data-s="${id}"></canvas><strong>${e.nome}</strong></button>`).join("");
  document.querySelectorAll("#especies canvas").forEach((c) => { const ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; const im = imagemBicho(c.dataset.s, false, false); ctx.drawImage(im, 0, 2, 72, Math.round(72 * im.height / im.width)); });
  document.querySelectorAll(".especie").forEach((x) => x.addEventListener("click", () => { Som.desbloquear(); escolhida = x.dataset.e; Som.voz(escolhida); document.querySelectorAll(".especie").forEach((y) => y.setAttribute("aria-pressed", String(y === x))); }));
}
function pintarTumulo() {
  const cv = $("#cvTumulo"), ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false; cenaQuarto(ctx, true, 0, 192, 192, 140);
  ctx.fillStyle = "#0b1328"; ctx.fillRect(62, 56, 70, 88); ctx.fillRect(70, 48, 54, 12);
  ctx.fillStyle = "#6b7280"; ctx.fillRect(64, 62, 66, 80); ctx.fillRect(72, 52, 50, 12); ctx.fillStyle = "#9ca3af"; ctx.fillRect(64, 62, 6, 80); ctx.fillRect(72, 52, 50, 4);
  ctx.fillStyle = "#1f2937"; ctx.fillRect(92, 70, 10, 34); ctx.fillRect(81, 80, 32, 10);
  ctx.fillStyle = "#16a34a"; for (let i = 0; i < 18; i++) ctx.fillRect(50 + i * 6, 140 + (i % 2) * 2, 4, 8);
  const b = estado.bicho; if (b) { const im = imagemBicho(b.especie, true, true); ctx.globalAlpha = 0.35; ctx.imageSmoothingEnabled = true; ctx.drawImage(im, 136, 100, im.width * 8 / im.fn, im.height * 8 / im.fn); ctx.globalAlpha = 1; }
}
function telaTumulo() {
  const b = estado.bicho; mostrar("telaTumulo"); pintarTumulo();
  $("#tumuloNome").textContent = b.nome;
  $("#btnNovo").textContent = estado.reserva.length ? `Voltar para ${estado.reserva[0].nome}` : "Criar outro bichinho";
  $("#tumuloTexto").textContent = `${ESPECIES[b.especie].nome} · viveu ${fmtIdade(b.idade)} · partiu por ${b.causa}`;
}
function mostrarJogo() {
  const b = estado.bicho;
  if (!b) return telaEscolher();
  if (!b.vivo) return telaTumulo();
  mostrar("telaJogo"); ajustarCena(); atualizar();
}
function cemiterio() {
  const l = estado.cemiterio;
  folha("Cemitério", l.length ? `<div class="cemit-lista">${[...l].reverse().map((c) => `<div class="cemit-item"><strong>${c.nome}</strong> · ${c.especie}<small>Viveu ${c.idade} · partiu por ${c.causa}</small></div>`).join("")}</div>` : `<p class="suave">Ninguém por aqui. Cuide bem do seu bichinho!</p>`);
}
function atualizarSom() { $("#btnSom").innerHTML = icone(estado.som ? "somligado" : "somdesligado"); $("#btnSom").setAttribute("aria-pressed", String(!estado.som)); }

/* ---------- ligações ---------- */
$("#btnChocar").addEventListener("click", () => { Som.desbloquear(); if (adicionando && estado.bicho) estado.reserva.push(estado.bicho); adicionando = false; $("#btnVoltarEsc").hidden = true; posX = alvoX = MUNDO / 2; estado.bicho = criarBicho(escolhida, $("#inputNome").value); $("#inputNome").value = ""; estado.ultimo = Date.now(); gravar(); mostrarJogo(); });
$("#btnNovo").addEventListener("click", () => { const b = estado.bicho; if (b && !b.vivo) estado.cemiterio.push({ nome: b.nome, especie: ESPECIES[b.especie].nome, idade: fmtIdade(b.idade), causa: b.causa }); estado.bicho = estado.reserva.shift() || null; gravar(); posX = alvoX = MUNDO / 2; mostrarJogo(); });
$("#acoes").addEventListener("click", (e) => { const x = e.target.closest("[data-a]"); if (x && !x.disabled) acao(x.dataset.a); });
$("#btnCemiterio").addEventListener("click", cemiterio);
$("#folhaFechar").addEventListener("click", fechar);
$("#folhaFundo").addEventListener("click", (e) => { if (e.target.id === "folhaFundo") fechar(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });
$("#btnRapido").addEventListener("click", () => { estado.rapido = !estado.rapido; $("#btnRapido").setAttribute("aria-pressed", String(estado.rapido)); aviso(estado.rapido ? "Modo teste: tempo 60× mais rápido" : "Tempo normal"); gravar(); });
$("#btnRapido").setAttribute("aria-pressed", String(estado.rapido));
$("#btnSom").addEventListener("click", () => { estado.som = !estado.som; Som.definir(estado.som); if (estado.som) { Som.desbloquear(); Som.musica(true); Som.efeito("ping"); } gravar(); atualizarSom(); });
Som.definir(estado.som); atualizarSom();
let musicaIniciada = false;
document.addEventListener("pointerdown", () => { if (!musicaIniciada && estado.som) { musicaIniciada = true; Som.desbloquear(); Som.musica(true); } }, { capture: true });

function relogio() {
  const agora = Date.now(), seg = Math.max(0, (agora - estado.ultimo) / 1000);
  estado.ultimo = agora;
  const b = estado.bicho;
  if (b && b.vivo) {
    const viva = b.vivo;
    avancar(b, Math.min((seg * (estado.rapido ? 60 : 1)) / 60, MAX_OFFLINE_MIN));
    if (viva && !b.vivo) { gravar(); Som.efeito("triste"); return telaTumulo(); }
    if (!$("#telaJogo").hidden && !cena) atualizar();
  }
  if (estado.reserva.length) {
    estado.reserva.forEach((r) => { if (r.vivo) { avancar(r, Math.min((seg * (estado.rapido ? 60 : 1)) / 60, MAX_OFFLINE_MIN)); if (!r.vivo) { estado.cemiterio.push({ nome: r.nome, especie: ESPECIES[r.especie].nome, idade: fmtIdade(r.idade), causa: r.causa }); notificar(`${r.nome} partiu...`, `Ele ficou sem cuidados (${r.causa}).`); } } });
    estado.reserva = estado.reserva.filter((r) => r.vivo);
  }
  conferirAvisos();
  gravar();
}
document.addEventListener("visibilitychange", () => { Som.pausar(document.hidden); if (!document.hidden) { relogio(); cancelarNativo(); } else agendarNativo(); });
setInterval(relogio, 1000);
setInterval(pintarCena, 50);
relogio(); mostrarJogo();


/* ---------- vários bichinhos ---------- */
const MAX_BICHOS = 4;
function abrirBichos() {
  const todos = [estado.bicho, ...estado.reserva].filter(Boolean);
  const cartao = (b, i) => `<button class="cartao item${i === 0 ? " em-uso" : ""}" data-b="${i}" aria-label="${b.nome}"><span class="prev" data-q="${i}"></span><span class="nome">${b.nome}</span><small class="${i === 0 ? "tem" : ""}">${i === 0 ? "Com você" : "Trocar"}</small></button>`;
  const mais = todos.length < MAX_BICHOS ? `<button class="cartao item mais" data-mais="1" aria-label="Adicionar bichinho"><span class="plus">+</span><span class="nome">Novo bichinho</span></button>` : "";
  const sup = !!NativoAv || "Notification" in window;
  folha("Seus bichinhos", `<div class="jogos itens">${todos.map(cartao).join("")}${mais}</div>${sup ? `<button class="linha-av" id="btnAvisos" aria-pressed="${!!estado.avisos}">${icone("sino")}<span><strong>Avisos</strong><small>Me avisar quando tiver fome, sede ou sono</small></span><i class="chave"></i></button>` : ""}<button class="linha-av" id="btnAtu"><span><strong>Procurar atualização</strong><small>Ver se há uma versão nova do jogo</small></span></button>`, (el) => {
    el.querySelector("#btnAtu").addEventListener("click", () => { fechar(); atuConferir(true); });
    el.querySelectorAll("[data-q]").forEach((m) => { const i = +m.dataset.q, b = todos[i]; m.appendChild(previaPet(b, b.look || {})); });
    el.querySelectorAll("[data-b]").forEach((x) => x.addEventListener("click", () => {
      const i = +x.dataset.b; if (i === 0) return fechar();
      const atual = estado.bicho; estado.bicho = estado.reserva[i - 1]; estado.reserva[i - 1] = atual; cena = null; posX = alvoX = MUNDO / 2; Som.voz(estado.bicho.especie); gravar(); fechar(); mostrarJogo();
    }));
    const m = el.querySelector("[data-mais]"); if (m) m.addEventListener("click", () => { fechar(); adicionando = true; telaEscolher(); $("#btnVoltarEsc").hidden = false; });
    const av = el.querySelector("#btnAvisos"); if (av) av.addEventListener("click", async () => {
      if (!estado.avisos) { let ok = false; if (NativoAv) { try { ok = (await NativoAv.requestPermissions()).display === "granted"; } catch (e) {} } else { ok = Notification.permission === "granted"; if (!ok) { try { ok = (await Notification.requestPermission()) === "granted"; } catch (e) {} } } if (!ok) return aviso("O aparelho não deixou mostrar avisos."); estado.avisos = true; aviso(`${estado.bicho.nome} vai te chamar quando precisar.`); }
      else { estado.avisos = false; cancelarNativo(); }
      gravar(); av.setAttribute("aria-pressed", String(!!estado.avisos));
    });
  });
}
$("#btnBichos").addEventListener("click", abrirBichos);
$("#btnVoltarEsc").addEventListener("click", () => { adicionando = false; $("#btnVoltarEsc").hidden = true; mostrarJogo(); });

/* ---------- avisos: fome, sede, sono... (funciona enquanto o app está aberto ou em segundo plano) ---------- */
function notificar(titulo, texto) {
  if (!estado.avisos) return;
  if (!document.hidden) return aviso(`${titulo} ${texto}`.slice(0, 70));
  if (NativoAv) return;                                                   // no aplicativo, os avisos são agendados antes de sair (agendarNativo)
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then((r) => r.showNotification(titulo, { body: texto, icon: "icone-192.png", tag: "vetogoshi" })).catch(() => new Notification(titulo, { body: texto, icon: "icone-192.png" }));
    else new Notification(titulo, { body: texto, icon: "icone-192.png" });
  } catch (e) {}
}
const PRECISA = [["fome", (b) => b.fome < 28, "está com fome!", "Que tal um lanchinho?"], ["sede", (b) => b.sede < 28, "está com sede!", "Ele quer beber algo."], ["sono", (b) => !b.dormindo && b.energia < 18, "está cansado.", "Hora de dormir."], ["banheiro", (b) => b.vontade >= 85 || b.cocos > 0, "precisa ir ao banheiro!", "Leve-o antes que faça no chão."], ["tedio", (b) => b.tedio < 18, "está entediado.", "Brinque um pouco com ele."], ["saude", (b) => b.saude < 35, "não está bem!", "Ele precisa de remédio e cuidado."]];
function conferirAvisos() {
  if (!estado.avisos) return;
  const agora = Date.now();
  [estado.bicho, ...estado.reserva].forEach((b) => {
    if (!b || !b.vivo || b.ovo) return; b.av = b.av || {};
    PRECISA.forEach(([id, teste, msg, dica]) => {
      if (!teste(b)) { delete b.av[id]; return; }
      if (b.av[id] && agora - b.av[id] < 45 * 60 * 1000) return;                        // não repete antes de 45 minutos
      b.av[id] = agora; notificar(`${b.nome} ${msg}`, dica);
    });
  });
}

/* ---------- no aplicativo (Android): avisos agendados no celular, chegam mesmo com o app fechado ---------- */
var NativoAv = (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ? window.Capacitor.registerPlugin("LocalNotifications") : null;
async function cancelarNativo() { if (!NativoAv) return; try { const p = await NativoAv.getPending(); if (p.notifications.length) await NativoAv.cancel({ notifications: p.notifications }); } catch (e) {} }
async function agendarNativo() {
  if (!NativoAv || !estado.avisos) return;
  await cancelarNativo();
  const lista = [], agora = Date.now();
  [estado.bicho, ...estado.reserva].forEach((b) => {
    if (!b || !b.vivo || b.ovo) return;
    const c = JSON.parse(JSON.stringify(b)), feitos = new Set(); let min = 0;
    while (min < 24 * 60 && c.vivo && feitos.size < PRECISA.length) {
      avancar(c, 5); min += 5;
      PRECISA.forEach(([id, teste, msg, dica]) => { if (!feitos.has(id) && teste(c)) { feitos.add(id); lista.push({ quando: agora + Math.max(min, 20) * 60000, titulo: `${b.nome} ${msg}`, corpo: dica }); } });
    }
    if (!c.vivo) lista.push({ quando: agora + min * 60000, titulo: `${b.nome} partiu...`, corpo: "Ele ficou sem cuidados." });
  });
  lista.sort((a, z) => a.quando - z.quando);
  const notifications = lista.slice(0, 20).map((n, i) => ({ id: i + 1, title: n.titulo, body: n.corpo, schedule: { at: new Date(n.quando), allowWhileIdle: true } }));
  if (notifications.length) { try { await NativoAv.schedule({ notifications }); } catch (e) {} }
}
if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {            // botão "voltar" do Android: fecha a janelinha; sem janelinha, sai
  const App = window.Capacitor.registerPlugin("App");
  App.addListener("backButton", () => { if (!$("#folhaFundo").hidden) fechar(); else if (adicionando) $("#btnVoltarEsc").click(); else App.exitApp(); });
}
