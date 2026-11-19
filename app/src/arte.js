"use strict";
/* ===== Arte do Bichix: bichinhos refinados (grade fina + contorno + luz e sombra), cenários e ícones de pixel ===== */
const ESPECIES = {
  gato: { nome: "Gatinho", cores: { o: "#fb923c", a: "#fed7aa", d: "#9a3412", w: "#fff" }, fome: 1, sono: 1.2, tedio: 0.9,
    sprite: ["dd........dd","dod......dod","dooooooooood",".oooooooooo.",".oeooooooeo.",".oooooooooo.",".oooommoooo.",".oooooooooo.","..ooaaaaoo..","..ooaaaaoo..","..oo....oo..","..dd....dd.."] },
  cao: { nome: "Cachorrinho", cores: { o: "#d6a46a", a: "#f5e1c0", d: "#7c4a1e", w: "#fff" }, fome: 1.2, sono: 0.9, tedio: 1.1,
    sprite: ["..oooooooo..",".oooooooooo.","ddoooooooodd","ddoeooooeodd","ddoooooooodd","ddooodddoodd","..ooommooo..","..oooooooo..","..ooaaaaoo..","..ooaaaaoo..","..oo....oo..","..dd....dd.."] },
  coelho: { nome: "Coelhinho", cores: { o: "#f9a8d4", a: "#fff1f7", d: "#be185d", w: "#fff" }, fome: 0.9, sono: 1, tedio: 1,
    sprite: ["..oo....oo..","..oo....oo..","..oa....ao..","..oo....oo..",".oooooooooo.",".oeoooooeoo.",".oooooooooo.",".ooooddoooo.","..oooooooo..","..ooaaaaoo..","..oo....oo..","..dd....dd.."] },
  dino: { olha: 1, nome: "Dinossauro", cores: { o: "#4ade80", a: "#bbf7d0", d: "#166534", w: "#fff" }, fome: 1.3, sono: 0.8, tedio: 0.9,
    sprite: ["...d.d.d....","..oooooooo..",".oooooooooo.",".oeoooooeoo.",".oooooooooo.",".oooommmooo.","..ooaaaaoo.d","d.ooaaaaoooo","dd.ooaaooo..","..oooooooo..","..oo....oo..","..dd....dd.."] },
  pinto: { olha: 1, nome: "Pintinho", cores: { o: "#fde047", a: "#fff7c2", d: "#ea580c", w: "#fff" }, fome: 1, sono: 1.1, tedio: 1.2,
    sprite: ["....dd......","...oooo.....","..oooooo....",".oooeoooo...",".dddoooooo..","..oooooooo..","..oooooooo..","..oaaaaaoo..","..oaaaaaoo..","...oooooo...","...d.dd.d...","..dd.dd.dd.."] },
  gosma: { nome: "Gosminha", cores: { o: "#a78bfa", a: "#ddd6fe", d: "#5b21b6", w: "#fff" }, fome: 0.8, sono: 0.8, tedio: 1.3,
    sprite: ["............","....oooo....","..oooooooo..",".oooooooooo.",".oeooooooeo.",".oooooooooo.",".ooooommooo.","oooaaooooooo","oooaaooooooo","oooooooooooo","dooooooooood",".dddddddddd."] },
};
/* ---- bichinhos montados por peças: 4 linhas de topo (orelhas, chifres...) + corpo comum, com pequenas trocas por espécie ---- */
const TOPOS = {
  pontudas: ["dd........dd", "dod......dod", "dooooooooood", ".oooooooooo."],
  redondas: ["..dd....dd..", ".dadd..ddad.", "..oooooooo..", ".oooooooooo."],
  longas: ["..oo....oo..", "..oo....oo..", "..oa....ao..", ".oooooooooo."],
  caidas: ["..oooooooo..", ".oooooooooo.", "ddoooooooodd", "ddoooooooodd"],
  chifres: ["d.d......d.d", "dd.d....d.dd", "..oooooooo..", ".oooooooooo."],
  crista: ["...d.dd.d...", "...dddddd...", "..oooooooo..", ".oooooooooo."],
  lisos: ["............", "....oooo....", "..oooooooo..", ".oooooooooo."],
  grandes: ["..oo....oo..", ".oaoo..ooao.", ".oaoo..ooao.", ".oooooooooo."],
  juba: ["..dddddddd..", ".dddddddddd.", "dddooooooddd", "dddooooooddd"],
};
const CORPO = [".oeooooooeo.", ".oooooooooo.", ".oooommoooo.", ".oooooooooo.", "..ooaaaaoo..", "..ooaaaaoo..", "..oo....oo..", "..dd....dd.."];
const montar = (topo, mod) => { const r = [...TOPOS[topo], ...CORPO]; if (mod) mod(r); return r; };
const poe = (r, i, txt) => { r[i] = txt; };
const NOVAS = {
  urso: { nome: "Ursinho", cores: { o: "#b45309", a: "#fcd9b0", d: "#78350f", w: "#fff" }, fome: 1.3, sono: 1.2, tedio: 0.8, sprite: montar("redondas", (r) => { poe(r, 5, ".oooaaaaooo."); poe(r, 6, ".ooooddoooo."); }) },
  panda: { nome: "Panda", cores: { o: "#f8fafc", a: "#e2e8f0", d: "#111827", w: "#fff" }, fome: 1.2, sono: 1.2, tedio: 0.8, sprite: montar("redondas", (r) => { poe(r, 4, ".ddeooooedd."); poe(r, 5, ".ddoooooodd."); poe(r, 6, ".oooodddoooo".slice(0, 11) + "."); poe(r, 8, "..ddaaaadd.."); poe(r, 9, "..ddaaaadd.."); }) },
  leao: { nome: "Leãozinho", cores: { o: "#fbbf24", a: "#fde68a", d: "#b45309", w: "#fff" }, fome: 1.2, sono: 1, tedio: 0.9, sprite: montar("juba", (r) => { poe(r, 4, "ddeooooooedd"); poe(r, 5, "ddoooooooodd"); poe(r, 6, "ddoooommoodd"); poe(r, 7, "ddoooooooodd"); }) },
  tigre: { nome: "Tigrinho", cores: { o: "#fb923c", a: "#fff7ed", d: "#7c2d12", w: "#fff" }, fome: 1.1, sono: 1, tedio: 1, sprite: montar("pontudas", (r) => { poe(r, 5, ".odooooodoo."); poe(r, 7, ".odooooodoo."); poe(r, 8, "..oodaaadoo."); }) },
  vaca: { nome: "Vaquinha", cores: { o: "#f8fafc", a: "#fbcfe8", d: "#1f2937", w: "#fff" }, fome: 1.3, sono: 1, tedio: 0.8, sprite: montar("caidas", (r) => { poe(r, 5, ".ooddoooooo."); poe(r, 6, ".oooaaaaooo."); poe(r, 7, ".ooooooddoo."); }) },
  cervo: { nome: "Cervinho", cores: { o: "#b7793f", a: "#fde7c7", d: "#5b3a1a", w: "#fff" }, fome: 0.9, sono: 1, tedio: 1, sprite: montar("chifres") },
  porquinho: { nome: "Porquinho", cores: { o: "#f9a8d4", a: "#fbcfe8", d: "#be185d", w: "#fff" }, fome: 1.4, sono: 1.1, tedio: 0.8, sprite: montar("pontudas", (r) => { poe(r, 5, ".oooaaaaooo."); poe(r, 6, ".oooaddaooo."); }) },
  rato: { nome: "Ratinho", cores: { o: "#cbd5e1", a: "#fbcfe8", d: "#64748b", w: "#fff" }, fome: 1, sono: 1, tedio: 1.2, sprite: montar("grandes") },
  elefante: { nome: "Elefantinho", cores: { o: "#94a3b8", a: "#cbd5e1", d: "#475569", w: "#fff" }, fome: 1.4, sono: 0.9, tedio: 0.8, sprite: montar("grandes", (r) => { poe(r, 6, ".ooooddoooo."); poe(r, 7, ".ooooddoooo."); poe(r, 8, "..oooddooo.."); }) },
  macaco: { nome: "Macaquinho", cores: { o: "#92400e", a: "#fcd9b0", d: "#451a03", w: "#fff" }, fome: 1, sono: 0.9, tedio: 1.4, sprite: montar("redondas", (r) => { poe(r, 4, ".oeaaaaaaeo."); poe(r, 5, ".oaaaaaaaao."); poe(r, 6, ".oaaammaaao."); }) },
  sapo: { nome: "Sapinho", cores: { o: "#84cc16", a: "#ecfccb", d: "#3f6212", w: "#fff" }, fome: 1, sono: 0.9, tedio: 1.1, sprite: montar("lisos", (r) => { poe(r, 2, "..oeooooeo.."); poe(r, 4, ".oooooooooo."); poe(r, 6, ".oommmmmmoo."); }) },
  galo: { nome: "Galinho", cores: { o: "#f8fafc", a: "#fbbf24", d: "#dc2626", w: "#fff" }, fome: 1, sono: 1, tedio: 1.1, sprite: montar("crista", (r) => { poe(r, 6, ".ooooaaoooo."); }) },
  pinguim: { nome: "Pinguim", cores: { o: "#1e293b", a: "#f8fafc", d: "#f59e0b", w: "#fff" }, fome: 1.1, sono: 0.9, tedio: 1, sprite: montar("lisos", (r) => { poe(r, 4, ".oeaaaaaaeo."); poe(r, 5, ".ooaaaaaaoo."); poe(r, 6, ".ooaaddaaoo."); poe(r, 7, ".ooaaaaaaoo."); poe(r, 8, "..oaaaaaaoo."); poe(r, 9, "..oaaaaaaoo."); }) },
};
Object.assign(ESPECIES, NOVAS);
const OVO = ["...oooo...","..oooooo..",".oooooooo.",".owwooooo.",".owoooooo.",".oooooooo.",".oooooooo.",".oooooooo.","..oooooo..","...oooo..."];
const COR_OVO = { o: "#e9edf5", w: "#fff", d: "#9aa4b8" };

const mixar = (hex, alvo, k) => { const n = parseInt(hex.slice(1), 16), a = [n >> 16, (n >> 8) & 255, n & 255], b = parseInt(alvo.slice(1), 16), c = [b >> 16, (b >> 8) & 255, b & 255]; return "#" + a.map((v, i) => Math.round(v + (c[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
const escurecer = (h, k) => mixar(h, "#000000", k), clarear = (h, k) => mixar(h, "#ffffff", k);
const apagar = (hex) => { const n = parseInt(hex.slice(1), 16), m = ((n >> 16) + ((n >> 8) & 255) + (n & 255)) / 3; return mixar(hex, "#" + [m, m, m].map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""), 0.6); };

/* Pega o desenho 12x12 e devolve uma imagem de grade fina (3x): cantos arredondados, contorno escuro, luz vinda de cima,
   sombra embaixo e brilho nos olhos. Fica nítido e com volume, sem perder o jeito de pixel. */
const CACHE = new Map(), PAD_REL = 0.3;                          // o bichinho é desenhado na resolução da tela: fn = pontinhos por quadradinho do desenho
let RESOL = 2;                                                  // quantas vezes a tela de desenho é maior que as medidas do jogo (muda por cena)
const fnPara = (esc) => Math.max(12, Math.min(48, Math.round((esc * 4 * RESOL) / 4) * 4));
const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
function caixaH(src, dst, W, H, r) { const d = 2 * r + 1; for (let y = 0; y < H; y++) { let a = 0; const o = y * W; for (let x = -r; x <= r; x++) if (x >= 0 && x < W) a += src[o + x]; for (let x = 0; x < W; x++) { dst[o + x] = a / d; const sai = x - r, entra = x + r + 1; if (sai >= 0) a -= src[o + sai]; if (entra < W) a += src[o + entra]; } } }
function caixaV(src, dst, W, H, r) { const d = 2 * r + 1; for (let x = 0; x < W; x++) { let a = 0; for (let y = -r; y <= r; y++) if (y >= 0 && y < H) a += src[y * W + x]; for (let y = 0; y < H; y++) { dst[y * W + x] = a / d; const sai = y - r, entra = y + r + 1; if (sai >= 0) a -= src[sai * W + x]; if (entra < H) a += src[entra * W + x]; } } }
function gaussiano(src, W, H, sigma) {                          // borrão rápido (três caixas ≈ gaussiano): arredonda a silhueta e suaviza as cores
  const nn = 3, wi = Math.sqrt((12 * sigma * sigma) / nn + 1); let wl = Math.floor(wi); if (wl % 2 === 0) wl--; const wu = wl + 2;
  const m = Math.round((12 * sigma * sigma - nn * wl * wl - 4 * nn * wl - 3 * nn) / (-4 * wl - 4));
  let a = Float32Array.from(src), b = new Float32Array(src.length);
  for (let k = 0; k < nn; k++) { const r = ((k < m ? wl : wu) - 1) / 2; caixaH(a, b, W, H, r); caixaV(b, a, W, H, r); }
  return a;
}
function refinar(chave, linhas, cores, fechado, FN = 16) {
  chave = chave + "|" + FN;
  if (CACHE.has(chave)) return CACHE.get(chave);
  const PAD = Math.round(FN * PAD_REL);
  const H = linhas.length, W = Math.max(...linhas.map((l) => l.length));
  const cel = (x, y) => (y >= 0 && y < H && x >= 0 && x < W && linhas[y][x] && linhas[y][x] !== "." ? linhas[y][x] : null);
  const LET = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => { const c = cel(x, y); if (c !== "e") return c; const cont = {}; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const v = cel(x + a, y + b); if (v && v !== "e") cont[v] = (cont[v] || 0) + 1; }); const mm = Object.entries(cont).sort((p, q) => q[1] - p[1])[0]; return mm ? mm[0] : "o"; }));
  const letra = (x, y) => (y >= 0 && y < H && x >= 0 && x < W ? LET[y][x] : null);
  const FW = W * FN + PAD * 2, FH = H * FN + PAD * 2, n = FW * FH;
  const pal = { ...cores, e: "#0b1328", s: "#ffffff", m: "#0b1328" }, rgbDe = {};
  const dura = new Float32Array(n), cr = new Float32Array(n), cg = new Float32Array(n), cb = new Float32Array(n);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const qx = Math.floor((x - PAD) / FN), qy = Math.floor((y - PAD) / FN);
    if (!cel(qx, qy)) continue;
    const c = letra(qx, qy), i = y * FW + x; dura[i] = 1;
    const rgb = rgbDe[c] || (rgbDe[c] = hexRgb(pal[c] || "#ffffff")); cr[i] = rgb[0]; cg[i] = rgb[1]; cb[i] = rgb[2];
  }
  const M = gaussiano(dura, FW, FH, FN * 0.45), M1 = gaussiano(dura, FW, FH, FN * 0.035);
  const BR = gaussiano(cr, FW, FH, FN * 0.035), BG = gaussiano(cg, FW, FH, FN * 0.035), BB = gaussiano(cb, FW, FH, FN * 0.035);
  const M3 = gaussiano(dura, FW, FH, FN * 0.16), R3 = gaussiano(cr, FW, FH, FN * 0.16), G3 = gaussiano(cg, FW, FH, FN * 0.16), B3 = gaussiano(cb, FW, FH, FN * 0.16);
  const dentro = new Uint8Array(n); let topo = FH, base = 0;
  for (let i = 0; i < n; i++) if (M[i] >= 0.5 && M1[i] > 0.2) { dentro[i] = 1; const y = (i / FW) | 0; topo = Math.min(topo, y); base = Math.max(base, y); }
  const cv = document.createElement("canvas"); cv.width = FW; cv.height = FH; const cx = cv.getContext("2d"), img = cx.createImageData(FW, FH), P = img.data;
  const lx = -0.55, ly = -0.83, cl = (v) => Math.max(0, Math.min(255, v)), kluz = FN * 0.65;
  for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
    const i = y * FW + x, o = i * 4;
    if (dentro[i]) {
      const w = Math.max(0.05, M1[i]); let r = BR[i] / w, g = BG[i] / w, b = BB[i] / w;
      const gx = (M[i + 1] - M[i - 1]) / 2, gy = (M[i + FW] - M[i - FW]) / 2;
      const luz = -(gx * lx + gy * ly) * kluz;                                                  // virado para a luz (cima-esquerda) clareia, o outro lado escurece
      const t = (y - topo) / Math.max(1, base - topo), f = luz * 0.42 + (0.5 - t) * 0.2;
      if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { r *= 1 + f * 0.9; g *= 1 + f * 0.9; b *= 1 + f * 0.85; }
      P[o] = cl(r); P[o + 1] = cl(g); P[o + 2] = cl(b); P[o + 3] = 255;
    } else if (M3[i] > 0.12) {                                                                 // contorno: um fio escuro, da cor do bichinho
      const w = M3[i]; P[o] = cl((R3[i] / w) * 0.28); P[o + 1] = cl((G3[i] / w) * 0.28); P[o + 2] = cl((B3[i] / w) * 0.34); P[o + 3] = cl(((w - 0.12) / 0.07) * 255);
    }
  }
  cx.putImageData(img, 0, 0);
  for (let qy = 0; qy < H; qy++) for (let qx = 0; qx < W; qx++) if (cel(qx, qy) === "e") {      // olhos: bolinhas escuras com brilho (fechados: risquinho curvo)
    const ex = PAD + (qx + 0.5) * FN, ey = PAD + (qy + 0.5) * FN;
    if (fechado) { cx.strokeStyle = "#0b1328"; cx.lineWidth = FN * 0.2; cx.lineCap = "round"; cx.beginPath(); cx.arc(ex, ey - FN * 0.18, FN * 0.34, 0.2 * Math.PI, 0.8 * Math.PI); cx.stroke(); }
    else {
      cx.fillStyle = "#0b1328"; cx.beginPath(); cx.arc(ex, ey, FN * 0.43, 0, 7); cx.fill();
      cx.fillStyle = "#ffffff"; cx.beginPath(); cx.arc(ex - FN * 0.14, ey - FN * 0.16, FN * 0.15, 0, 7); cx.fill(); cx.beginPath(); cx.arc(ex + FN * 0.14, ey + FN * 0.14, FN * 0.07, 0, 7); cx.fill();
    }
  }
  cv.fn = FN; cv.pad = PAD; CACHE.set(chave, cv); return cv;
}
const imagemBicho = (esp, fechado, cinza, fn = 16) => { const e = ESPECIES[esp]; return refinar(`${esp}|${fechado ? 1 : 0}|${cinza ? 1 : 0}`, e.sprite, cinza ? Object.fromEntries(Object.entries(e.cores).map(([k, v]) => [k, apagar(v)])) : e.cores, fechado, fn); };
const imagemOvo = (fn = 16) => refinar("ovo", OVO, COR_OVO, false, fn);

/* ícones de pixel (balões de pensamento, corações...) */
const PIX = {
  coracao: ["..a.a..", ".aaaaa.", "aaaaaaa", "aaaaaaa", ".aaaaa.", "..aaa..", "...a..."],
  comida: ["...d...", "..ddd..", ".aaaaa.", "aaaaaaa", "aaaaaaa", ".aaaaa.", "..a.a.."],
  gota: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "aaaaaaa", ".aaaaa.", "..aaa.."],
  lua: ["..aaa..", ".aa....", "aa.....", "aa.....", "aa.....", ".aa..aa", "..aaaa."],
  cruz: ["..aaa..", "..aaa..", "aaaaaaa", "aaaaaaa", "aaaaaaa", "..aaa..", "..aaa.."],
  bola: ["..aaa..", ".aadaa.", "aaadaaa", "addddda", "aaadaaa", ".aadaa.", "..aaa.."],
  estrela: ["...a...", "...a...", "aaaaaaa", ".aaaaa.", "..aaa..", ".aa.aa.", ".a...a."],
  prato: [".ddddd.", "daaaaad", "daaaaad", "daaaaad", ".ddddd.", "ddddddd", "......."],
  lanche: ["..aaa..", ".aaaaa.", "ddddddd", "bbbbbbb", "ddddddd", ".aaaaa.", "..aaa.."],
  doce: ["..aaa..", ".aaaaa.", "aaaaaaa", ".ddddd.", "..ddd..", "..ddd..", "...d..."],
  copo: ["ddddddd", "d.....d", "daaaaad", "daaaaad", "daaaaad", ".daaad.", "..ddd.."],
  lata: ["..ddd..", ".aaaaa.", ".aaaaa.", ".aaaaa.", ".aaaaa.", ".aaaaa.", "..ddd.."],
  privada: ["aaaaa..", "aaaaa..", ".aaa...", "ddddddd", "ddddddd", ".ddddd.", "..ddd.."],
};
const COR_PIX = { coracao: ["#fb7185", "#fb7185"], comida: ["#f87171", "#16a34a"], gota: ["#38bdf8", "#38bdf8"], lua: ["#fde047", "#fde047"], cruz: ["#e879f9", "#e879f9"], bola: ["#fb923c", "#7c2d12"], estrela: ["#fde047", "#fde047"], prato: ["#f59e0b", "#e5e7eb"], lanche: ["#fbbf24", "#16a34a", "#7c2d12"], doce: ["#f9a8d4", "#d97706"], copo: ["#fb923c", "#e0f2fe"], lata: ["#ef4444", "#cbd5e1"], privada: ["#94a3b8", "#f1f5f9"] };
function pix(ctx, nome, x, y, s) { const l = PIX[nome], [ca, cd, cb] = COR_PIX[nome]; l.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== ".") { ctx.fillStyle = r[i] === "d" ? cd : r[i] === "b" ? cb : ca; ctx.fillRect(x + i * s, y + j * s, s, s); } }); }
function balao(ctx, nome, cx, baseY) {
  ctx.fillStyle = "#0b1328"; ctx.fillRect(cx - 17, baseY - 31, 34, 28); ctx.fillRect(cx - 4, baseY - 4, 8, 4);
  ctx.fillStyle = "#f8fafc"; ctx.fillRect(cx - 15, baseY - 29, 30, 24); ctx.fillRect(cx - 2, baseY - 5, 4, 5);
  pix(ctx, nome, cx - 10, baseY - 26, 3);
}

/* ---------- cenários (tela de 192 x 192) ---------- */
let LARG = 224, ALT = 420, CHAO = 250, BASE = 290;     // medidas da cena principal (ajustadas ao tamanho da tela)
function cenaQuarto(ctx, escuro, t, W = LARG, H = ALT, C = CHAO) {
  const bg = escuro ? "#0a1022" : "#16305a";
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = escuro ? "#101a36" : "#1d3d72"; for (let x = 0; x < W; x += 28) ctx.fillRect(x, 0, 14, C);
  ctx.fillStyle = escuro ? "#16203f" : "#274d8c"; ctx.fillRect(0, C - 10, W, 10);                 // rodapé
  ctx.fillStyle = escuro ? "#070b18" : "#1e3a6a"; ctx.fillRect(0, C, W, H - C);
  ctx.fillStyle = escuro ? "#0b1226" : "#27497f"; for (let y = C + 14; y < H; y += 18) ctx.fillRect(0, y, W, 2);
  ctx.fillStyle = "#22d3ee55"; ctx.fillRect(0, C - 1, W, 2);
  const jy = Math.round(C * 0.2);                                                                  // janela com lua
  ctx.fillStyle = "#0b1328"; ctx.fillRect(18, jy, 60, 54); ctx.fillStyle = escuro ? "#0d1530" : "#2a5aa8"; ctx.fillRect(21, jy + 3, 54, 48); ctx.fillStyle = "#0b1328"; ctx.fillRect(47, jy + 3, 2, 48); ctx.fillRect(21, jy + 26, 54, 2);
  ctx.fillStyle = "#fde68a"; ctx.fillRect(56, jy + 9, 9, 9); ctx.fillStyle = escuro ? "#0d1530" : "#2a5aa8"; ctx.fillRect(59, jy + 7, 8, 9);
  ctx.fillStyle = "#ffffffaa"; [[27, jy + 10], [38, jy + 36], [64, jy + 40], [30, jy + 42]].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2));
  ctx.fillStyle = "#0b1328"; ctx.fillRect(W - 66, jy + 4, 46, 36); ctx.fillStyle = escuro ? "#2a1538" : "#e879f9"; ctx.fillRect(W - 63, jy + 7, 40, 30); ctx.fillStyle = escuro ? "#1b1030" : "#22d3ee"; ctx.fillRect(W - 58, jy + 12, 30, 20);   // quadro
  ctx.fillStyle = "#7c4a1e"; ctx.fillRect(W - 54, C - 34, 22, 24); ctx.fillStyle = "#16a34a"; ctx.fillRect(W - 58, C - 56, 8, 26); ctx.fillRect(W - 46, C - 64, 8, 34); ctx.fillRect(W - 34, C - 52, 8, 24);   // planta
  if (W > 300) {                                                                                     // quarto largo: mais janela e um abajur
    const mx = Math.round(W / 2) - 30; ctx.fillStyle = "#0b1328"; ctx.fillRect(mx, jy, 60, 54); ctx.fillStyle = escuro ? "#0d1530" : "#2a5aa8"; ctx.fillRect(mx + 3, jy + 3, 54, 48); ctx.fillStyle = "#0b1328"; ctx.fillRect(mx + 29, jy + 3, 2, 48); ctx.fillRect(mx + 3, jy + 26, 54, 2);
    const lx = Math.round(W / 2) + 110; ctx.fillStyle = "#0b1328"; ctx.fillRect(lx - 2, C - 66, 6, 56); ctx.fillStyle = escuro ? "#92400e" : "#fbbf24"; ctx.fillRect(lx - 16, C - 90, 34, 26); ctx.fillStyle = "#fde68a55"; if (!escuro) ctx.fillRect(lx - 24, C - 62, 50, 54);
  }
  ctx.fillStyle = escuro ? "#3b1d4d" : "#7c3aed"; ctx.beginPath(); ctx.ellipse(W / 2, BASE - 2, 84, 18, 0, 0, 7); ctx.fill();
  ctx.fillStyle = escuro ? "#2a1538" : "#a78bfa"; ctx.beginPath(); ctx.ellipse(W / 2, BASE - 2, 66, 12, 0, 0, 7); ctx.fill();
}
function cenaBanho(ctx, t, W = LARG, H = ALT, C = CHAO) {
  ctx.fillStyle = "#cfeaf5"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#a9d6e8"; for (let y = 0; y < C; y += 28) ctx.fillRect(0, y, W, 2); for (let x = 0; x < W; x += 28) ctx.fillRect(x, 0, 2, C);
  ctx.fillStyle = "#7fb7cf"; ctx.fillRect(0, C, W, H - C); ctx.fillStyle = "#6aa6c2"; ctx.fillRect(0, C, W, 3);
  const sx = W - 70;
  ctx.fillStyle = "#94a3b8"; ctx.fillRect(sx + 40, 0, 6, 70); ctx.fillRect(sx - 6, 66, 52, 8); ctx.fillStyle = "#cbd5e1"; ctx.fillRect(sx - 8, 74, 34, 9); ctx.fillStyle = "#94a3b8"; ctx.fillRect(sx - 8, 83, 34, 3);
  ctx.fillStyle = "#38bdf8"; for (let i = 0; i < 20; i++) { const x = sx - 6 + (i % 8) * 4, y = 90 + ((t * 5 + i * 17) % (BASE - 100)); ctx.fillRect(x, y, 2, 7); }
  for (let i = 0; i < 9; i++) { const x = 18 + i * 24 + Math.sin(t / 8 + i) * 4, y = H - ((t * 1.2 + i * 37) % (H - 40)); ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3) * 2, 0, 7); ctx.stroke(); }
}
function esfera(ctx, x, y, r, cor, escura) {                       // bolinha com volume: luz de cima, sombra embaixo
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05); g.addColorStop(0, "#ffffff"); g.addColorStop(0.25, cor); g.addColorStop(1, escura);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
function nuvem(ctx, x, y, w) { ctx.fillStyle = "#ffffffee"; ctx.beginPath(); ctx.ellipse(x, y, w * 0.5, w * 0.16, 0, 0, 7); ctx.ellipse(x - w * 0.18, y - w * 0.1, w * 0.22, w * 0.18, 0, 0, 7); ctx.ellipse(x + w * 0.1, y - w * 0.16, w * 0.26, w * 0.22, 0, 0, 7); ctx.fill(); }
function cenaCampo(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, "#38bdf8"); g.addColorStop(1, "#bae6fd"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, 192);
  const sol = ctx.createRadialGradient(160, 26, 2, 160, 26, 30); sol.addColorStop(0, "#fff7ae"); sol.addColorStop(0.35, "#fde04788"); sol.addColorStop(1, "#fde04700"); ctx.fillStyle = sol; ctx.fillRect(110, 0, 82, 70);
  ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(160, 26, 9, 0, 7); ctx.fill();
  nuvem(ctx, 40 + ((t * 4) % 40), 26, 44); nuvem(ctx, 120 - ((t * 3) % 30), 44, 52);
  ctx.fillStyle = "#86efac"; ctx.beginPath(); ctx.moveTo(0, 96); ctx.quadraticCurveTo(50, 70, 110, 90); ctx.quadraticCurveTo(150, 100, 192, 80); ctx.lineTo(192, 100); ctx.lineTo(0, 100); ctx.fill();
  const c = ctx.createLinearGradient(0, 96, 0, 192); c.addColorStop(0, "#4ade80"); c.addColorStop(1, "#15803d"); ctx.fillStyle = c; ctx.fillRect(0, 96, 192, 96);
  ctx.fillStyle = "#ffffff12"; for (let y = 104; y < 192; y += 24) ctx.fillRect(0, y, 192, 11);
  ctx.fillStyle = "#14532d55"; ctx.fillRect(0, 96, 192, 2);
}
const bolinha = (ctx, x, y, r = 5, cor = "#fb923c") => {
  ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.ellipse(x, y + r + 2, r * 0.9, r * 0.32, 0, 0, 7); ctx.fill();
  esfera(ctx, x, y, r, cor, "#9a3412"); ctx.strokeStyle = "#7c2d12"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0.4, 2.4); ctx.moveTo(x - r, y); ctx.quadraticCurveTo(x, y + r * 0.35, x + r, y); ctx.stroke();
};

/* desenha o bichinho com a base dos pés em baseY */
function desenharBicho(ctx, esp, cx, baseY, esc, o = {}) {
  const fn = fnPara(esc); let im = imagemBicho(esp, !!o.fechado, !!o.cinza, fn); if (o.tinta) im = imagemTingida(im, `${esp}|${o.fechado ? 1 : 0}|${o.cinza ? 1 : 0}|${fn}`, o.tinta);
  const S = (esc * 4) / fn, w = im.width * S, h = im.height * S;
  const x = Math.round(cx - w / 2), y = Math.round(baseY - h + im.pad * S);
  ctx.fillStyle = "rgba(0,0,0,0.26)"; ctx.beginPath(); ctx.ellipse(cx, baseY + 3, w * 0.34, Math.max(4, esc * 2), 0, 0, 7); ctx.fill();
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  if (o.espelho) { ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.translate(-cx, 0); }
  ctx.drawImage(im, x, y, w, h); ctx.restore();
  return { x, y, w, h };
}

/* banheiro: azulejo rosa, rolo de papel e privada de verdade (o bichinho aparece menor, sentado nela) */
function cenaPrivada(ctx, t, W = LARG, H = ALT, C = CHAO) {
  ctx.fillStyle = "#fdeaf4"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f6c6de"; for (let y = 0; y < C; y += 28) ctx.fillRect(0, y, W, 1.5); for (let x = 0; x < W; x += 28) ctx.fillRect(x, 0, 1.5, C);
  const ch = ctx.createLinearGradient(0, C, 0, H); ch.addColorStop(0, "#b9a7f0"); ch.addColorStop(1, "#7c6bd0"); ctx.fillStyle = ch; ctx.fillRect(0, C, W, H - C);
  ctx.fillStyle = "#ffffff22"; for (let x = 0; x < W; x += 40) ctx.fillRect(x, C, 1.5, H - C); ctx.fillStyle = "#6d5bc088"; ctx.fillRect(0, C, W, 3);
  const cx = Math.round(W / 2);
  const tg = ctx.createLinearGradient(0, C - 150, 0, C - 100); tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#d5deea"); ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 40, C - 150, 80, 52, 8) : ctx.rect(cx - 40, C - 150, 80, 52); ctx.fill(); ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#cbd5e1"; ctx.fillRect(cx - 44, C - 154, 88, 7); ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(cx + 22, C - 160, 4, 0, 7); ctx.fill(); ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx + 21, C - 160, 2, 6);
  ctx.fillStyle = "#94a3b8"; ctx.fillRect(28, C - 96, 6, 22); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(46, C - 86, 13, 0, 7); ctx.fill(); ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(46, C - 86, 8, 0, 7); ctx.stroke(); ctx.fillStyle = "#e5e7eb"; ctx.fillRect(34, C - 74, 12, 26);
  ctx.fillStyle = "#7c4a1e"; ctx.fillRect(W - 58, C - 34, 26, 30); ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.ellipse(W - 45, C - 52, 18, 20, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.ellipse(W - 52, C - 48, 8, 15, -0.5, 0, 7); ctx.fill();
}
function privadaFrente(ctx, t, W, base, u) {
  const cx = Math.round(W / 2);
  const g = ctx.createLinearGradient(0, base - 34, 0, base + 4); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#cfd8e6");
  ctx.fillStyle = "#00000026"; ctx.beginPath(); ctx.ellipse(cx, base + 12, 62, 8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 30, base - 8, 60, 18, 6) : ctx.rect(cx - 30, base - 8, 60, 18); ctx.fill();
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 52, base - 36, 104, 34, 14) : ctx.rect(cx - 52, base - 36, 104, 34); ctx.fill(); ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = "#ffffffcc"; ctx.fillRect(cx - 44, base - 33, 60, 3);
  if (u > 0.62) { const k = (u - 0.62) / 0.38; for (let i = 0; i < 3; i++) { const r = 8 + ((k * 40 + i * 14) % 42); ctx.strokeStyle = `rgba(56,189,248,${Math.max(0, 0.8 - r / 56)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, base - 16, r * 1.3, r * 0.45, 0, 0, 7); ctx.stroke(); } ctx.fillStyle = "#38bdf8"; for (let i = 0; i < 6; i++) ctx.fillRect(cx - 30 + i * 12, base - 62 + ((t * 4 + i * 11) % 40), 3, 8); }
}
function imagemPix(nome) { const c = document.createElement("canvas"); c.width = c.height = 42; pix(c.getContext("2d"), nome, 0, 0, 6); return c; }

/* coração desenhado em vetor: gradiente, brilho e contorno (x,y = centro; r = meia largura) */
function coracaoBonito(ctx, x, y, r, alfa = 1, giro = 0, cheio = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(giro); ctx.globalAlpha *= alfa;
  const p = new Path2D(); p.moveTo(0, r * 0.95); p.bezierCurveTo(-r * 1.35, r * 0.15, -r * 1.1, -r * 0.95, -r * 0.42, -r * 0.95); p.bezierCurveTo(-r * 0.12, -r * 0.95, 0, -r * 0.7, 0, -r * 0.45); p.bezierCurveTo(0, -r * 0.7, r * 0.12, -r * 0.95, r * 0.42, -r * 0.95); p.bezierCurveTo(r * 1.1, -r * 0.95, r * 1.35, r * 0.15, 0, r * 0.95); p.closePath();
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.4);
  if (cheio) { g.addColorStop(0, "#ffb4c6"); g.addColorStop(0.45, "#fb4f7a"); g.addColorStop(1, "#c2185b"); } else { g.addColorStop(0, "#475569"); g.addColorStop(1, "#1e293b"); }
  ctx.fillStyle = g; ctx.fill(p); ctx.lineJoin = "round"; ctx.lineWidth = Math.max(0.8, r * 0.14); ctx.strokeStyle = cheio ? "#8f1239" : "#0f172a"; ctx.stroke(p);
  if (cheio) { ctx.fillStyle = "#ffffffcc"; ctx.beginPath(); ctx.ellipse(-r * 0.58, -r * 0.5, r * 0.2, r * 0.11, -0.7, 0, 7); ctx.fill(); }
  ctx.restore();
}
