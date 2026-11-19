/* casa.js — cômodos, enfeites, roupas, perucas e cores do Vetogoshi (só desenho e catálogo; a loja fica em vetogoshi.js) */
const SALAS = [["quarto", "Quarto", "cama"], ["banheiro", "Banheiro", "banheiro"], ["cozinha", "Cozinha", "comer"], ["sala", "Sala", "sofa"]];
const R = (ctx, c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ELIPSE = (ctx, c, x, y, rx, ry) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill(); };

function cenaCozinha(ctx, t, W, H, C) {
  R(ctx, "#fde9c9", 0, 0, W, H); ctx.fillStyle = "#f6d9a8"; for (let x = 0; x < W; x += 32) ctx.fillRect(x, 0, 2, C); for (let y = 0; y < C; y += 32) ctx.fillRect(0, y, W, 2);
  for (let y = C; y < H; y += 26) for (let x = ((y / 26) % 2) * 26; x < W; x += 52) R(ctx, "#c98f5a", x, y, 26, 26);
  R(ctx, "#a96f3d", 0, C, W, H - C); for (let y = C; y < H; y += 26) for (let x = ((y - C) / 26 % 2) * 26; x < W; x += 52) R(ctx, "#c98f5a", x, y, 26, 26);
  R(ctx, "#8b5a2b", 0, C - 44, W, 44); R(ctx, "#d6a066", 0, C - 48, W, 6);                                  // bancada
  const fx = W - 150; R(ctx, "#cbd5e1", fx, C - 46, 80, 46); R(ctx, "#94a3b8", fx + 6, C - 38, 68, 30); ELIPSE(ctx, "#1e293b", fx + 20, C - 52, 10, 3); ELIPSE(ctx, "#1e293b", fx + 58, C - 52, 10, 3);
  R(ctx, "#0b1328", 60, 26, 70, 56); R(ctx, "#7dd3fc", 64, 30, 62, 48); R(ctx, "#0b1328", 94, 30, 2, 48); R(ctx, "#fde047", 108, 38, 10, 10);
  R(ctx, "#b45309", 190, 18, 90, 40); R(ctx, "#92400e", 190, 18, 90, 4); R(ctx, "#92400e", 234, 18, 2, 40); R(ctx, "#fde68a", 226, 36, 6, 4); R(ctx, "#fde68a", 238, 36, 6, 4);
}
function cenaSala(ctx, t, W, H, C) {
  R(ctx, "#3b2a5c", 0, 0, W, H); ctx.fillStyle = "#47346f"; for (let x = 0; x < W; x += 36) ctx.fillRect(x, 0, 18, C);
  R(ctx, "#2a1d44", 0, C - 10, W, 10);
  R(ctx, "#7a4b2a", 0, C, W, H - C); ctx.fillStyle = "#5e3820"; for (let y = C + 16; y < H; y += 20) ctx.fillRect(0, y, W, 2); for (let x = 0; x < W; x += 70) ctx.fillRect(x + ((Math.round(x / 70) % 2) * 30), C, 2, H - C);
  R(ctx, "#0b1328", W - 120, 30, 80, 66); R(ctx, "#fcd34d", W - 116, 34, 72, 58); R(ctx, "#fef08a", W - 116, 34, 72, 26); R(ctx, "#0b1328", W - 82, 34, 2, 58); R(ctx, "#fff7ae55", W - 130, C - 20, 100, 20);
  R(ctx, "#0b1328", 40, 36, 52, 40); R(ctx, "#f472b6", 44, 40, 44, 32); R(ctx, "#22d3ee", 52, 50, 28, 14);
}
function cenaBanheiroCasa(ctx, t, W, H, C) {
  R(ctx, "#e7ecf3", 0, 0, W, H); ctx.fillStyle = "#cfd8e6"; for (let y = 0; y < C; y += 28) ctx.fillRect(0, y, W, 2); for (let x = 0; x < W; x += 28) ctx.fillRect(x, 0, 2, C);
  R(ctx, "#94a3b8", 0, C, W, H - C); R(ctx, "#7c8aa0", 0, C, W, 3); ctx.fillStyle = "#8493a8"; for (let x = 0; x < W; x += 56) ctx.fillRect(x, C, 2, H - C);
  const tx = W - 96; R(ctx, "#f8fafc", tx, C - 96, 56, 36); R(ctx, "#94a3b8", tx, C - 100, 56, 6); R(ctx, "#f8fafc", tx - 6, C - 52, 68, 40); R(ctx, "#cbd5e1", tx - 6, C - 16, 68, 8);       // privada
  R(ctx, "#f8fafc", 40, C - 60, 66, 14); R(ctx, "#cbd5e1", 40, C - 46, 66, 4); R(ctx, "#94a3b8", 66, C - 42, 14, 34);                                                                      // pia
  R(ctx, "#0b1328", 38, 24, 70, 62); R(ctx, "#bae6fd", 42, 28, 62, 54); R(ctx, "#ffffff88", 48, 34, 14, 40);                                                                              // espelho
  const cx = W / 2 + 10; ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, 8, 22, 0, Math.PI); ctx.stroke(); R(ctx, "#94a3b8", cx - 3, 0, 6, 10);           // chuveiro
}
const CENAS = { banheiro: cenaBanheiroCasa, cozinha: cenaCozinha, sala: cenaSala };

/* ---------- enfeites: cada um se desenha sozinho no cômodo (W = largura do mundo, C = linha do chão) ---------- */
const BASE_Y = (C) => C + 38;
const DECOR = {
  "tapete-estrela": (c, W, C) => { ELIPSE(c, "#be185d", W / 2, BASE_Y(C) - 4, 130, 24); ELIPSE(c, "#f9a8d4", W / 2, BASE_Y(C) - 4, 112, 18); c.fillStyle = "#fde047"; [[-60, -8], [0, 4], [58, -6]].forEach(([x, y]) => c.fillRect(W / 2 + x, BASE_Y(C) - 8 + y, 6, 6)); },
  "poster-foguete": (c, W, C) => { R(c, "#0b1328", 124, 22, 44, 62); R(c, "#1e1b4b", 127, 25, 38, 56); R(c, "#e2e8f0", 142, 36, 10, 26); R(c, "#ef4444", 142, 30, 10, 8); R(c, "#ef4444", 136, 54, 6, 12); R(c, "#ef4444", 152, 54, 6, 12); R(c, "#fb923c", 143, 64, 8, 8); R(c, "#fde047", 132, 30, 2, 2); R(c, "#fde047", 158, 44, 2, 2); },
  "cama-pet": (c, W, C) => { R(c, "#7c2d12", 40, BASE_Y(C) - 32, 100, 8); R(c, "#f472b6", 44, BASE_Y(C) - 46, 92, 20); R(c, "#fbcfe8", 48, BASE_Y(C) - 50, 28, 12); R(c, "#7c2d12", 40, BASE_Y(C) - 30, 6, 24); R(c, "#7c2d12", 134, BASE_Y(C) - 30, 6, 24); },
  "luzes": (c, W, C, t) => { c.strokeStyle = "#0b1328"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 6); for (let x = 0; x <= W; x += 14) c.lineTo(x, 6 + Math.sin(x / 34) * 10 + 10); c.stroke(); const cs = ["#f87171", "#fde047", "#4ade80", "#38bdf8", "#e879f9"]; for (let x = 10, i = 0; x < W; x += 28, i++) R(c, ((Math.floor(t / 20) + i) % 3 ? cs[i % 5] : "#ffffff"), x, 12 + Math.sin(x / 34) * 10 + 8, 6, 8); },
  "tapete-pato": (c, W, C) => { ELIPSE(c, "#38bdf8", W / 2 - 40, BASE_Y(C) - 4, 100, 20); ELIPSE(c, "#bae6fd", W / 2 - 40, BASE_Y(C) - 4, 84, 14); },
  "quadro-peixe": (c, W, C) => { R(c, "#0b1328", W / 2 - 24, 30, 56, 44); R(c, "#7dd3fc", W / 2 - 20, 34, 48, 36); R(c, "#fb923c", W / 2 - 8, 48, 18, 10); R(c, "#fb923c", W / 2 + 10, 51, 8, 6); R(c, "#0b1328", W / 2 - 3, 51, 2, 2); },
  "patinho": (c, W, C) => { R(c, "#fde047", W / 2 + 70, BASE_Y(C) - 18, 22, 14); R(c, "#fde047", W / 2 + 80, BASE_Y(C) - 28, 14, 12); R(c, "#fb923c", W / 2 + 92, BASE_Y(C) - 24, 6, 4); R(c, "#0b1328", W / 2 + 88, BASE_Y(C) - 25, 2, 2); },
  "toalheiro": (c, W, C) => { R(c, "#94a3b8", 170, 70, 70, 4); R(c, "#f472b6", 176, 72, 24, 38); R(c, "#38bdf8", 208, 72, 24, 32); },
  "mesa": (c, W, C) => { R(c, "#8b5a2b", W / 2 + 40, BASE_Y(C) - 52, 100, 8); R(c, "#6f4520", W / 2 + 48, BASE_Y(C) - 44, 6, 40); R(c, "#6f4520", W / 2 + 126, BASE_Y(C) - 44, 6, 40); ELIPSE(c, "#e2e8f0", W / 2 + 90, BASE_Y(C) - 58, 18, 6); R(c, "#ef4444", W / 2 + 80, BASE_Y(C) - 68, 10, 10); R(c, "#facc15", W / 2 + 92, BASE_Y(C) - 66, 10, 8); },
  "geladeira": (c, W, C) => { R(c, "#0b1328", 8, C - 126, 62, 130); R(c, "#e2e8f0", 10, C - 124, 58, 126); R(c, "#94a3b8", 10, C - 70, 58, 3); R(c, "#64748b", 58, C - 112, 4, 30); R(c, "#64748b", 58, C - 62, 4, 22); },
  "relogio": (c, W, C) => { ELIPSE(c, "#0b1328", 160, 40, 20, 20); ELIPSE(c, "#f8fafc", 160, 40, 16, 16); R(c, "#0b1328", 159, 28, 2, 12); R(c, "#0b1328", 160, 39, 9, 2); },
  "quadro-frutas": (c, W, C) => { R(c, "#0b1328", W / 2 - 20, 20, 52, 40); R(c, "#fef3c7", W / 2 - 16, 24, 44, 32); R(c, "#ef4444", W / 2 - 8, 34, 12, 12); R(c, "#facc15", W / 2 + 10, 34, 12, 12); },
  "sofa": (c, W, C) => { R(c, "#7e22ce", W / 2 + 30, BASE_Y(C) - 76, 130, 40); R(c, "#9333ea", W / 2 + 22, BASE_Y(C) - 50, 146, 36); R(c, "#7e22ce", W / 2 + 16, BASE_Y(C) - 56, 14, 44); R(c, "#7e22ce", W / 2 + 160, BASE_Y(C) - 56, 14, 44); R(c, "#c084fc", W / 2 + 40, BASE_Y(C) - 46, 50, 18); R(c, "#c084fc", W / 2 + 96, BASE_Y(C) - 46, 50, 18); },
  "tv": (c, W, C, t) => { R(c, "#0b1328", 150, 40, 110, 72); R(c, "#1e293b", 154, 44, 102, 58); for (let i = 0; i < 6; i++) R(c, ["#f87171", "#fb923c", "#fde047", "#4ade80", "#38bdf8", "#c084fc"][(i + Math.floor(t / 25)) % 6], 158 + i * 16, 48, 14, 50); R(c, "#0b1328", 192, 112, 26, 8); },
  "estante": (c, W, C) => { R(c, "#5e3820", 8, C - 120, 70, 124); R(c, "#7a4b2a", 12, C - 116, 62, 116); for (let i = 0; i < 3; i++) { R(c, "#5e3820", 12, C - 116 + i * 38, 62, 3); [["#ef4444", 6], ["#38bdf8", 8], ["#4ade80", 6], ["#fde047", 7]].reduce((x, [k, w]) => { R(c, k, x, C - 112 + i * 38, w, 30); return x + w + 2; }, 18); } },
  "planta-grande": (c, W, C) => { R(c, "#7c4a1e", W - 50, C - 36, 30, 36); R(c, "#16a34a", W - 56, C - 90, 12, 56); R(c, "#22c55e", W - 42, C - 110, 12, 76); R(c, "#16a34a", W - 28, C - 80, 12, 46); },
  "tapete-sala": (c, W, C) => { ELIPSE(c, "#0e7490", W / 2 - 30, BASE_Y(C) - 4, 140, 24); ELIPSE(c, "#67e8f9", W / 2 - 30, BASE_Y(C) - 4, 120, 18); },

  "tapete-lua": (c, W, C) => { ELIPSE(c, "#312e81", W / 2 + 20, BASE_Y(C) - 4, 124, 22); ELIPSE(c, "#6366f1", W / 2 + 20, BASE_Y(C) - 4, 106, 16); c.fillStyle = "#fde68a"; c.beginPath(); c.arc(W / 2 + 20, BASE_Y(C) - 6, 10, 0, 7); c.fill(); ELIPSE(c, "#6366f1", W / 2 + 26, BASE_Y(C) - 9, 8, 7); },
  "abajur": (c, W, C) => { ELIPSE(c, "#fde04728", W - 62, C - 70, 40, 46); R(c, "#7c2d12", W - 64, C - 40, 4, 40); ELIPSE(c, "#7c2d12", W - 62, C + 1, 14, 4); c.fillStyle = "#fbbf24"; c.beginPath(); c.moveTo(W - 82, C - 40); c.lineTo(W - 74, C - 70); c.lineTo(W - 50, C - 70); c.lineTo(W - 42, C - 40); c.closePath(); c.fill(); c.strokeStyle = "#b45309"; c.lineWidth = 2; c.stroke(); },
  "bau": (c, W, C) => { R(c, "#0b1328", 176, BASE_Y(C) - 50, 70, 46); R(c, "#b45309", 179, BASE_Y(C) - 38, 64, 31); R(c, "#d97706", 179, BASE_Y(C) - 47, 64, 12); R(c, "#78350f", 179, BASE_Y(C) - 38, 64, 3); R(c, "#fde047", 207, BASE_Y(C) - 40, 8, 10); R(c, "#ef4444", 186, BASE_Y(C) - 58, 10, 12); R(c, "#38bdf8", 226, BASE_Y(C) - 56, 10, 10); },
  "ursinho": (c, W, C) => { const x = W / 2 + 130, y = BASE_Y(C) - 20; ELIPSE(c, "#a16207", x, y, 18, 18); ELIPSE(c, "#fde68a", x, y + 4, 10, 10); ELIPSE(c, "#a16207", x, y - 24, 14, 13); ELIPSE(c, "#a16207", x - 11, y - 34, 5, 5); ELIPSE(c, "#a16207", x + 11, y - 34, 5, 5); R(c, "#111827", x - 6, y - 27, 3, 4); R(c, "#111827", x + 3, y - 27, 3, 4); ELIPSE(c, "#fde68a", x, y - 20, 5, 4); R(c, "#111827", x - 1, y - 22, 3, 2); },
  "estrelas-teto": (c, W, C, t) => { for (let i = 0; i < 14; i++) { const x = 20 + ((i * 97) % (W - 40)), y = 10 + ((i * 53) % 60), br = Math.abs(Math.sin(t / 30 + i)); c.fillStyle = `rgba(253,224,71,${0.5 + br * 0.5})`; R(c, x - 1, y - 4, 2, 8); R(c, x - 4, y - 1, 8, 2); } },
  "cesto": (c, W, C) => { R(c, "#0b1328", W / 2 - 40, BASE_Y(C) - 62, 56, 58); R(c, "#d6a066", W / 2 - 37, BASE_Y(C) - 59, 50, 52); c.fillStyle = "#b9824a"; for (let i = 0; i < 4; i++) c.fillRect(W / 2 - 37, BASE_Y(C) - 52 + i * 12, 50, 2); R(c, "#f472b6", W / 2 - 30, BASE_Y(C) - 70, 36, 14); },
  "tapete-flor": (c, W, C) => { ELIPSE(c, "#fda4af", W / 2 - 30, BASE_Y(C) - 4, 96, 18); c.fillStyle = "#fff"; for (let i = 0; i < 5; i++) { const a = i * 1.257; c.beginPath(); c.arc(W / 2 - 30 + Math.cos(a) * 14, BASE_Y(C) - 4 + Math.sin(a) * 5, 6, 0, 7); c.fill(); } ELIPSE(c, "#fde047", W / 2 - 30, BASE_Y(C) - 4, 5, 3); },
  "espelho-redondo": (c, W, C) => { ELIPSE(c, "#0b1328", 150, 54, 28, 28); ELIPSE(c, "#bae6fd", 150, 54, 24, 24); c.fillStyle = "#ffffff99"; c.beginPath(); c.ellipse(142, 46, 4, 9, -0.6, 0, 7); c.fill(); },
  "tapete-xadrez": (c, W, C) => { const x = W / 2 - 80, y = BASE_Y(C) - 12; R(c, "#dc2626", x, y, 160, 18); c.fillStyle = "#fff"; for (let i = 0; i < 10; i++) c.fillRect(x + 4 + i * 16, y + (i % 2) * 8 + 1, 8, 8); },
  "fruteira": (c, W, C) => { const x = 150, y = C - 50; ELIPSE(c, "#b45309", x, y, 24, 7); ELIPSE(c, "#ef4444", x - 10, y - 8, 7, 7); ELIPSE(c, "#facc15", x + 3, y - 10, 7, 7); ELIPSE(c, "#fb923c", x + 14, y - 7, 7, 7); ELIPSE(c, "#92400e", x, y - 1, 24, 4); },
  "vasinho": (c, W, C) => { const x = 36, y = C - 50; R(c, "#c2410c", x - 9, y - 16, 18, 16); R(c, "#9a3412", x - 11, y - 18, 22, 4); c.fillStyle = "#22c55e"; for (let i = -1; i <= 1; i++) { c.beginPath(); c.ellipse(x + i * 7, y - 28, 4, 11, i * 0.5, 0, 7); c.fill(); } },
  "pufe": (c, W, C) => { const x = W / 2 - 110, y = BASE_Y(C) - 22; ELIPSE(c, "#00000030", x, y + 18, 30, 5); ELIPSE(c, "#ea580c", x, y + 6, 30, 18); ELIPSE(c, "#fb923c", x, y - 4, 28, 14); R(c, "#ffffff55", x - 14, y - 10, 12, 3); },
  "aquario": (c, W, C, t) => { const x = W / 2 - 110, y = 52; R(c, "#0b1328", x - 4, y - 4, 104, 66); R(c, "#38bdf8", x, y, 96, 58); R(c, "#7dd3fc", x, y, 96, 14); R(c, "#d6a066", x, y + 50, 96, 8); for (let i = 0; i < 2; i++) { const fx = x + 12 + ((t * 0.7 + i * 46) % 76), fy = y + 22 + i * 14 + Math.sin(t / 8 + i) * 3; ELIPSE(c, i ? "#fb923c" : "#f472b6", fx, fy, 7, 4); R(c, i ? "#fb923c" : "#f472b6", fx - 11, fy - 3, 5, 6); R(c, "#111827", fx + 3, fy - 2, 2, 2); } c.fillStyle = "#22c55e"; c.fillRect(x + 10, y + 36, 4, 16); c.fillRect(x + 72, y + 32, 4, 20); },
  "quadro-grande": (c, W, C) => { const x = W / 2 - 50, y = 14; R(c, "#0b1328", x, y, 84, 52); R(c, "#7dd3fc", x + 4, y + 4, 76, 44); c.fillStyle = "#16a34a"; c.beginPath(); c.moveTo(x + 4, y + 48); c.lineTo(x + 28, y + 22); c.lineTo(x + 46, y + 40); c.lineTo(x + 60, y + 26); c.lineTo(x + 80, y + 48); c.closePath(); c.fill(); ELIPSE(c, "#fde047", x + 64, y + 14, 6, 6); },
  "vaso-flores": (c, W, C) => { const x = W / 2 + 200, y = BASE_Y(C) - 4; R(c, "#7c3aed", x - 12, y - 38, 24, 38); R(c, "#6d28d9", x - 14, y - 40, 28, 6); c.strokeStyle = "#16a34a"; c.lineWidth = 2; ["#f472b6", "#fde047", "#f87171"].forEach((cc, i) => { const dx = (i - 1) * 12; c.beginPath(); c.moveTo(x, y - 40); c.lineTo(x + dx, y - 64 - (i % 2) * 8); c.stroke(); ELIPSE(c, cc, x + dx, y - 66 - (i % 2) * 8, 6, 6); }); },
  "violao": (c, W, C) => { const x = W - 74, y = C - 6; c.save(); c.translate(x, y); c.rotate(-0.18); ELIPSE(c, "#b45309", 0, -18, 15, 17); ELIPSE(c, "#d97706", 0, -42, 12, 13); ELIPSE(c, "#1c0f06", 0, -28, 6, 6); R(c, "#6b3f1d", -3, -90, 6, 48); R(c, "#4b2a12", -5, -96, 10, 8); c.restore(); },
};

/* ---------- roupas: sprites pequenos, cores por letra ---------- */
const SPR = {
  festa: { l: ["....o....", "...aaa...", "...aba...", "..aabaa..", "..aaaaa..", ".aabaaba.", "aaaaaaaaa"], c: { a: "#ec4899", b: "#fde047", o: "#fde047" }, ancora: "topo" },
  cartola: { l: ["..ddddddd..", "..ddddddd..", "..ddddddd..", "..dbbbbbd..", "..ddddddd..", "ddddddddddd"], c: { d: "#111827", b: "#dc2626" }, ancora: "topo" },
  coroa: { l: ["a..a.a..a", "aa.aaa.aa", "aaaaaaaaa", "abaaaaaba", "aaaaaaaaa"], c: { a: "#fbbf24", b: "#ef4444" }, ancora: "topo" },
  gorro: { l: ["...bbb...", "..aaaaa..", ".aaaaaaa.", "aaaaaaaaa", "ddddddddd", "ddddddddd"], c: { a: "#38bdf8", b: "#f8fafc", d: "#0ea5e9" }, ancora: "topo" },
  "oculos-sol": { l: ["ddddd...ddddd", "ddddd.d.ddddd", "ddddd...ddddd", ".ddd.....ddd."], c: { d: "#111827" }, ancora: "olhos" },
  "oculos-redondo": { l: ["bbbbb...bbbbb", "b...b.b.b...b", "b...b...b...b", "bbbbb...bbbbb"], c: { b: "#fbbf24" }, ancora: "olhos" },
  "oculos-coracao": { l: ["rr.rr...rr.rr", "rrrrr...rrrrr", ".rrr.....rrr.", "..r.......r.."], c: { r: "#f43f5e" }, ancora: "olhos" },
  "peruca-rosa": { l: ["...aaaaaaa...", "..aaaaaaaaa..", ".aaaaaaaaaaa.", "aaaa.....aaaa", "aaa.......aaa"], c: { a: "#f472b6" }, ancora: "peruca" },
  "peruca-azul": { l: ["...aaaaaaa...", "..aaaaaaaaa..", ".aaaaaaaaaaa.", "aaaa.....aaaa", "aaa.......aaa"], c: { a: "#38bdf8" }, ancora: "peruca" },
  "peruca-verde": { l: ["...aaaaaaa...", "..aaaaaaaaa..", ".aaaaaaaaaaa.", "aaaa.....aaaa", "aaa.......aaa"], c: { a: "#4ade80" }, ancora: "peruca" },
  "peruca-arcoiris": { l: ["...aaaaaaa...", "..bbbbbbbbb..", ".ccccccccccc.", "dddd.....dddd", "eee.......eee"], c: { a: "#ef4444", b: "#fb923c", c: "#fde047", d: "#4ade80", e: "#38bdf8" }, ancora: "peruca" },
  bone: { l: ["...aaaaa...", "..aaaaaaa..", ".aaaaaaaaa.", "aaaaaaaaaaa", "bbbbbbb...."], c: { a: "#ef4444", b: "#991b1b" }, ancora: "topo" },
  laco: { l: [".aa...aa.", "aaaa.aaaa", "aaaoaaaaa", "aaaa.aaaa", ".aa...aa."], c: { a: "#f43f5e", o: "#fbbf24" }, ancora: "topo" },
  pirata: { l: ["....ddddddd....", "...ddddddddd...", "..dddwdddwddd..", "..dddddwdddddd.", "..ddddddddddd..", "..ddd.....ddd.."], c: { d: "#1f2937", w: "#f8fafc" }, ancora: "topo" },
  chef: { l: [".aa.aaa.aa.", "aaaaaaaaaaa", "aaaaaaaaaaa", "aaaaaaaaaaa", ".bbbbbbbbb."], c: { a: "#f8fafc", b: "#cbd5e1" }, ancora: "topo" },
  "oculos-estrela": { l: ["..y.......y..", ".yyy.....yyy.", "yyyyy...yyyyy", ".yyy.....yyy.", "..y.......y.."], c: { y: "#fde047" }, ancora: "olhos" },
  "oculos-3d": { l: ["rrrrr...bbbbb", "r...r.d.b...b", "r...r...b...b", "rrrrr...bbbbb"], c: { r: "#ef4444", b: "#38bdf8", d: "#111827" }, ancora: "olhos" },
  "oculos-roxo": { l: ["ddddd...ddddd", "d...d.d.d...d", "d...d...d...d", "ddddd...ddddd"], c: { d: "#7c3aed" }, ancora: "olhos" },
  "peruca-roxa": { l: ["...aaaaaaa...", "..aaaaaaaaa..", ".aaaaaaaaaaa.", "aaaa.....aaaa", "aaa.......aaa"], c: { a: "#a855f7" }, ancora: "peruca" },
  "peruca-laranja": { l: ["...aaaaaaa...", "..aaaaaaaaa..", ".aaaaaaaaaaa.", "aaaa.....aaaa", "aaa.......aaa"], c: { a: "#fb923c" }, ancora: "peruca" },
  moicano: { l: ["....a....", "...aaa...", "...aaa...", "...aaa...", "...aaa..."], c: { a: "#f43f5e" }, ancora: "peruca" },
  cacheada: { l: ["..a.a.a.a..", ".aaaaaaaaa.", "aaaaaaaaaaa", "aaa.....aaa", "aa.......aa"], c: { a: "#92400e" }, ancora: "peruca" },
  gravata: { l: ["aaa.aaa", "aaaoaaa", "aaa.aaa"], c: { a: "#ef4444", o: "#b91c1c" }, ancora: "pescoco" },
  cachecol: { l: ["aaabbbaaabbb", "bbbaaabbbaaa", "aaabbbaaabbb", ".....aaa....", ".....bbb...."], c: { a: "#ef4444", b: "#f8fafc" }, ancora: "pescoco" },
  medalha: { l: ["a.......a", ".a.....a.", "..a...a..", "...ooo...", "...ooo..."], c: { a: "#3b82f6", o: "#fbbf24" }, ancora: "pescoco" },
  colar: { l: ["a.......a", ".a.....a.", "..a...a..", "...rrr...", "...rrr..."], c: { a: "#f8fafc", r: "#f43f5e" }, ancora: "pescoco" },
};
function desenharSprite(ctx, id, cx, y, largura) {
  const sp = SPR[id], cols = sp.l[0].length, s = largura / cols, x0 = cx - largura / 2;
  sp.l.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== ".") { ctx.fillStyle = sp.c[r[i]]; ctx.fillRect(Math.round(x0 + i * s), Math.round(y + j * s), Math.ceil(s) + 0, Math.ceil(s) + 0); } });
}
function vestir(ctx, b, a) {
  const lk = b.look; if (!lk || !a) return;
  const cx = a.x + a.w / 2, lw = a.w * 0.62;
  let topo = a.y;
  if (lk.peruca) { const sp = SPR[lk.peruca], s = lw / sp.l[0].length; desenharSprite(ctx, lk.peruca, cx, a.y - sp.l.length * s * 0.45, lw); topo = a.y - sp.l.length * s * 0.5; }
  if (lk.chapeu) { const sp = SPR[lk.chapeu], w = lw * 0.9, s = w / sp.l[0].length; desenharSprite(ctx, lk.chapeu, cx, topo - sp.l.length * s * 0.7, w); }
  if (lk.oculos) desenharSprite(ctx, lk.oculos, cx, a.y + a.h * 0.3, a.w * 0.55);
  if (lk.pescoco) { const sp = SPR[lk.pescoco]; desenharSprite(ctx, lk.pescoco, cx, a.y + a.h * 0.6, a.w * (sp.l[0].length > 8 ? 0.5 : 0.34)); }
}
function imagemSprite(id) { const sp = SPR[id], c = document.createElement("canvas"); c.width = 52; c.height = 40; const x = c.getContext("2d"), s = Math.min(4, 46 / sp.l[0].length); x.translate(26 - sp.l[0].length * s / 2, 20 - sp.l.length * s / 2); sp.l.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== ".") { x.fillStyle = sp.c[r[i]]; x.fillRect(Math.round(i * s), Math.round(j * s), Math.ceil(s), Math.ceil(s)); } }); return c; }

/* ---------- cores do bichinho: mistura a cor com a luz de cada ponto (contorno escuro fica) ---------- */
const CORES = { "cor-rosa": [251, 113, 133], "cor-azul": [56, 189, 248], "cor-verde": [74, 222, 128], "cor-dourado": [250, 204, 21], "cor-roxo": [192, 132, 252], "cor-laranja": [251, 146, 60], "cor-ciano": [34, 211, 238], "cor-vermelho": [239, 68, 68], "cor-cinza": [148, 163, 184] };
const TINTAS = new Map();
function imagemTingida(im, chave, rgb) {
  const kk = chave + "|" + rgb.join(",");
  if (TINTAS.has(kk)) return TINTAS.get(kk);
  const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (!p[i + 3]) continue; const lum = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11);
    if (lum < 55) continue;                                                                              // contorno e partes escuras ficam como são
    const k = 0.62, l = Math.min(1.15, (lum + 40) / 255);
    p[i] = p[i] * (1 - k) + rgb[0] * l * k; p[i + 1] = p[i + 1] * (1 - k) + rgb[1] * l * k; p[i + 2] = p[i + 2] * (1 - k) + rgb[2] * l * k;
  }
  x.putImageData(d, 0, 0); c.fn = im.fn; c.pad = im.pad; TINTAS.set(kk, c); return c;
}
const tintaDe = (b) => (b && b.look && b.look.cor && CORES[b.look.cor]) || null;

/* ---------- paredes e pisos: uma cor por cima do cômodo (mantém luz e sombra) ---------- */
const PAREDES = { "parede-rosa": [244, 114, 182], "parede-azul": [96, 165, 250], "parede-verde": [74, 222, 128], "parede-amarela": [250, 204, 21], "parede-lilas": [192, 132, 252], "parede-laranja": [251, 146, 60], "parede-menta": [45, 212, 191], "parede-vermelha": [248, 113, 113] };
const PISOS = { "piso-madeira": [217, 170, 110], "piso-cinza": [148, 163, 184], "piso-azul": [56, 189, 248], "piso-verde": [34, 197, 94], "piso-rosa": [244, 114, 182], "piso-roxo": [168, 85, 247] };
function tingirCena(ctx, p, f, W, H, C) {
  [[p, 0, C, PAREDES], [f, C, H - C, PISOS]].forEach(([id, y, h, tab]) => { const c = id && tab[id]; if (!c) return; ctx.save(); ctx.globalCompositeOperation = "color"; ctx.globalAlpha = 0.7; ctx.fillStyle = `rgb(${c})`; ctx.fillRect(0, y, W, h); ctx.restore(); });
}
function aplicarTema(ctx, sala, W, H, C) { const t = (estado.tema || {})[sala]; if (t) tingirCena(ctx, t.parede, t.piso, W, H, C); }
function previaTema(i) {
  if (PREVIAS.has(i.id)) return PREVIAS.get(i.id);
  const c = document.createElement("canvas"); c.width = 336; c.height = 252; const x = c.getContext("2d"); x.scale(0.75, 0.75);
  cenaSala(x, 0, 448, 336, 190); DECOR.sofa(x, 448, 190, 0); if (i.tipo === "parede" || i.tipo === "piso") tingirCena(x, i.tipo === "parede" ? i.id : null, i.tipo === "piso" ? i.id : null, 448, 336, 190);
  PREVIAS.set(i.id, c); return c;
}

/* ---------- catálogo da lojinha ---------- */
const ITENS = [
  { id: "tapete-estrela", tipo: "casa", sala: "quarto", nome: "Tapete de estrela", preco: 8 },
  { id: "poster-foguete", tipo: "casa", sala: "quarto", nome: "Pôster de foguete", preco: 10 },
  { id: "luzes", tipo: "casa", sala: "quarto", nome: "Luzinhas", preco: 12, req: { estrelas: 3 } },
  { id: "cama-pet", tipo: "casa", sala: "quarto", nome: "Caminha", preco: 18, req: { fase: 2 } },
  { id: "tapete-pato", tipo: "casa", sala: "banheiro", nome: "Tapete azul", preco: 6 },
  { id: "quadro-peixe", tipo: "casa", sala: "banheiro", nome: "Quadro de peixe", preco: 8 },
  { id: "patinho", tipo: "casa", sala: "banheiro", nome: "Patinho", preco: 5 },
  { id: "toalheiro", tipo: "casa", sala: "banheiro", nome: "Toalhas", preco: 12, req: { fase: 2 } },
  { id: "relogio", tipo: "casa", sala: "cozinha", nome: "Relógio", preco: 6 },
  { id: "quadro-frutas", tipo: "casa", sala: "cozinha", nome: "Quadro de frutas", preco: 8 },
  { id: "mesa", tipo: "casa", sala: "cozinha", nome: "Mesinha", preco: 14, req: { estrelas: 3 } },
  { id: "geladeira", tipo: "casa", sala: "cozinha", nome: "Geladeira", preco: 20, req: { fase: 2 } },
  { id: "planta-grande", tipo: "casa", sala: "sala", nome: "Planta grande", preco: 10 },
  { id: "tapete-sala", tipo: "casa", sala: "sala", nome: "Tapete azul", preco: 8 },
  { id: "estante", tipo: "casa", sala: "sala", nome: "Estante", preco: 14, req: { estrelas: 3 } },
  { id: "sofa", tipo: "casa", sala: "sala", nome: "Sofá", preco: 22, req: { fase: 2 } },
  { id: "tv", tipo: "casa", sala: "sala", nome: "Televisão", preco: 24, req: { estrelas: 8 } },
  { id: "festa", tipo: "chapeu", nome: "Chapéu de festa", preco: 10 },
  { id: "gorro", tipo: "chapeu", nome: "Gorro", preco: 12 },
  { id: "cartola", tipo: "chapeu", nome: "Cartola", preco: 16, req: { estrelas: 3 } },
  { id: "coroa", tipo: "chapeu", nome: "Coroa", preco: 30, req: { fase: 3 } },
  { id: "oculos-redondo", tipo: "oculos", nome: "Óculos redondo", preco: 8 },
  { id: "oculos-sol", tipo: "oculos", nome: "Óculos escuro", preco: 10 },
  { id: "oculos-coracao", tipo: "oculos", nome: "Óculos de coração", preco: 14, req: { estrelas: 3 } },
  { id: "peruca-rosa", tipo: "peruca", nome: "Peruca rosa", preco: 14 },
  { id: "peruca-azul", tipo: "peruca", nome: "Peruca azul", preco: 14 },
  { id: "peruca-verde", tipo: "peruca", nome: "Peruca verde", preco: 14 },
  { id: "peruca-arcoiris", tipo: "peruca", nome: "Peruca arco-íris", preco: 26, req: { estrelas: 8 } },
  { id: "cor-rosa", tipo: "cor", nome: "Cor rosa", preco: 12 },
  { id: "cor-azul", tipo: "cor", nome: "Cor azul", preco: 12 },
  { id: "cor-verde", tipo: "cor", nome: "Cor verde", preco: 12 },
  { id: "cor-roxo", tipo: "cor", nome: "Cor roxa", preco: 12, req: { estrelas: 3 } },
  { id: "cor-dourado", tipo: "cor", nome: "Cor dourada", preco: 25, req: { fase: 3 } },
  { id: "tapete-lua", tipo: "casa", sala: "quarto", nome: "Tapete de lua", preco: 9 },
  { id: "estrelas-teto", tipo: "casa", sala: "quarto", nome: "Estrelas brilhantes", preco: 14, req: { estrelas: 3 } },
  { id: "abajur", tipo: "casa", sala: "quarto", nome: "Abajur", preco: 12 },
  { id: "bau", tipo: "casa", sala: "quarto", nome: "Baú de brinquedos", preco: 16, req: { fase: 2 } },
  { id: "ursinho", tipo: "casa", sala: "quarto", nome: "Ursinho", preco: 10 },
  { id: "tapete-flor", tipo: "casa", sala: "banheiro", nome: "Tapete de flor", preco: 7 },
  { id: "espelho-redondo", tipo: "casa", sala: "banheiro", nome: "Espelho redondo", preco: 9 },
  { id: "cesto", tipo: "casa", sala: "banheiro", nome: "Cesto de roupa", preco: 11, req: { estrelas: 3 } },
  { id: "tapete-xadrez", tipo: "casa", sala: "cozinha", nome: "Tapete xadrez", preco: 8 },
  { id: "fruteira", tipo: "casa", sala: "cozinha", nome: "Fruteira", preco: 9 },
  { id: "vasinho", tipo: "casa", sala: "cozinha", nome: "Vasinho de planta", preco: 6 },
  { id: "pufe", tipo: "casa", sala: "sala", nome: "Pufe", preco: 12 },
  { id: "quadro-grande", tipo: "casa", sala: "sala", nome: "Quadro da montanha", preco: 10 },
  { id: "vaso-flores", tipo: "casa", sala: "sala", nome: "Vaso de flores", preco: 9 },
  { id: "violao", tipo: "casa", sala: "sala", nome: "Violão", preco: 16, req: { estrelas: 3 } },
  { id: "aquario", tipo: "casa", sala: "sala", nome: "Aquário", preco: 28, req: { fase: 3 } },
  { id: "bone", tipo: "chapeu", nome: "Boné", preco: 9 },
  { id: "laco", tipo: "chapeu", nome: "Laço", preco: 8 },
  { id: "chef", tipo: "chapeu", nome: "Chapéu de chef", preco: 14, req: { estrelas: 3 } },
  { id: "pirata", tipo: "chapeu", nome: "Chapéu de pirata", preco: 18, req: { estrelas: 8 } },
  { id: "oculos-estrela", tipo: "oculos", nome: "Óculos de estrela", preco: 14, req: { estrelas: 3 } },
  { id: "oculos-3d", tipo: "oculos", nome: "Óculos 3D", preco: 10 },
  { id: "oculos-roxo", tipo: "oculos", nome: "Óculos roxo", preco: 8 },
  { id: "peruca-roxa", tipo: "peruca", nome: "Peruca roxa", preco: 14 },
  { id: "peruca-laranja", tipo: "peruca", nome: "Peruca laranja", preco: 14 },
  { id: "moicano", tipo: "peruca", nome: "Moicano", preco: 18, req: { estrelas: 3 } },
  { id: "cacheada", tipo: "peruca", nome: "Peruca cacheada", preco: 16 },
  { id: "gravata", tipo: "pescoco", nome: "Gravata-borboleta", preco: 8 },
  { id: "cachecol", tipo: "pescoco", nome: "Cachecol", preco: 10 },
  { id: "medalha", tipo: "pescoco", nome: "Medalha", preco: 12, req: { estrelas: 3 } },
  { id: "colar", tipo: "pescoco", nome: "Colar de coração", preco: 14 },
  { id: "cor-laranja", tipo: "cor", nome: "Cor laranja", preco: 12 },
  { id: "cor-ciano", tipo: "cor", nome: "Cor ciano", preco: 12 },
  { id: "cor-vermelho", tipo: "cor", nome: "Cor vermelha", preco: 14, req: { estrelas: 3 } },
  { id: "cor-cinza", tipo: "cor", nome: "Cor prateada", preco: 16, req: { estrelas: 8 } },
  { id: "parede-rosa", tipo: "parede", nome: "Parede rosa", preco: 8 },
  { id: "parede-azul", tipo: "parede", nome: "Parede azul", preco: 8 },
  { id: "parede-verde", tipo: "parede", nome: "Parede verde", preco: 8 },
  { id: "parede-amarela", tipo: "parede", nome: "Parede amarela", preco: 8 },
  { id: "parede-lilas", tipo: "parede", nome: "Parede lilás", preco: 10 },
  { id: "parede-laranja", tipo: "parede", nome: "Parede laranja", preco: 10 },
  { id: "parede-menta", tipo: "parede", nome: "Parede menta", preco: 12, req: { estrelas: 3 } },
  { id: "parede-vermelha", tipo: "parede", nome: "Parede vermelha", preco: 12, req: { estrelas: 3 } },
  { id: "piso-madeira", tipo: "piso", nome: "Piso claro", preco: 8 },
  { id: "piso-cinza", tipo: "piso", nome: "Piso cinza", preco: 8 },
  { id: "piso-azul", tipo: "piso", nome: "Piso azul", preco: 10 },
  { id: "piso-verde", tipo: "piso", nome: "Piso verde", preco: 10 },
  { id: "piso-rosa", tipo: "piso", nome: "Piso rosa", preco: 12 },
  { id: "piso-roxo", tipo: "piso", nome: "Piso roxo", preco: 12 },
];

const CAMA_X = 130;
function camaDormir(ctx, x, base) {                                   // a caminha onde ele dorme (aparece só quando ele está dormindo no quarto)
  ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.ellipse(x, base + 2, 140, 9, 0, 0, 7); ctx.fill();
  R(ctx, "#7c2d12", x - 134, base - 56, 12, 62); R(ctx, "#7c2d12", x + 122, base - 40, 12, 46); R(ctx, "#92400e", x - 134, base - 24, 268, 10);
  const g = ctx.createLinearGradient(0, base - 38, 0, base - 22); g.addColorStop(0, "#fbcfe8"); g.addColorStop(1, "#ec4899"); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 124, base - 38, 248, 20, 8) : ctx.rect(x - 124, base - 38, 248, 20); ctx.fill();
  ELIPSE(ctx, "#ffffff", x - 92, base - 42, 34, 11); ELIPSE(ctx, "#e2e8f0", x - 92, base - 38, 30, 6);
}
function cobertor(ctx, a, t) {                                        // coberta por cima da barriga dele
  const y0 = a.y + a.h * 0.55, y1 = a.y + a.h + 2, x0 = a.x - 6, x1 = a.x + a.w + 6;
  ctx.fillStyle = "#60a5fa"; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0 + 6); for (let x = x0; x <= x1; x += 6) ctx.lineTo(x, y0 + Math.sin(x / 14 + t / 20) * 2.5); ctx.lineTo(x1, y1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 1.6; ctx.stroke(); ctx.fillStyle = "#bfdbfe"; for (let x = x0 + 10; x < x1 - 6; x += 22) { ctx.beginPath(); ctx.arc(x, y0 + (y1 - y0) * 0.5, 3, 0, 7); ctx.fill(); }
}

/* ---------- fotos da lojinha: o item desenhado de verdade (enfeite no cômodo, roupa/cor no próprio bichinho) ---------- */
const PREVIAS = new Map();
function previaDecor(id) {
  if (PREVIAS.has(id)) return PREVIAS.get(id);
  const g = document.createElement("canvas"); g.width = 448; g.height = 280; const gx = g.getContext("2d"); DECOR[id](gx, 448, 160, 0);
  const d = gx.getImageData(0, 0, 448, 280).data; let x0 = 448, y0 = 280, x1 = 0, y1 = 0;
  for (let y = 0; y < 280; y++) for (let x = 0; x < 448; x++) if (d[(y * 448 + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const w = Math.max(8, x1 - x0 + 1), h = Math.max(8, y1 - y0 + 1), k = Math.min(72 / w, 50 / h, 2), c = document.createElement("canvas"); c.width = 336; c.height = 252; const cx = c.getContext("2d");
  const f = cx.createLinearGradient(0, 0, 0, 252); f.addColorStop(0, "#3a5288"); f.addColorStop(1, "#1d2c52"); cx.fillStyle = f; cx.fillRect(0, 0, 336, 252);
  cx.fillStyle = "#ffffff14"; cx.fillRect(0, 186, 336, 66);
  cx.save(); cx.scale(3, 3); cx.fillStyle = "#0000002e"; cx.beginPath(); cx.ellipse(56, 66, Math.min(34, w * k / 2 + 4), 3.5, 0, 0, 7); cx.fill();
  cx.translate(56 - (x0 + w / 2) * k, 40 - (y0 + h / 2) * k); cx.scale(k, k); cx.imageSmoothingEnabled = false; DECOR[id](cx, 448, 160, 0); cx.restore();
  PREVIAS.set(id, c); return c;
}
function previaPet(b, look, ampliar = 1) {
  const c = document.createElement("canvas"); c.width = 336; c.height = 252; const cx = c.getContext("2d");
  const f = cx.createLinearGradient(0, 0, 0, 252); f.addColorStop(0, "#3a5288"); f.addColorStop(1, "#1d2c52"); cx.fillStyle = f; cx.fillRect(0, 0, 336, 252);
  cx.fillStyle = "#ffffff14"; cx.fillRect(0, 186, 336, 66);
  cx.setTransform(3, 0, 0, 3, 0, 0); const antes = RESOL; RESOL = 3;
  const fake = { look: look || {} }, a = desenharBicho(cx, b.especie, 56, 70 + (ampliar > 1 ? 10 : 0), 0.78 * ampliar, { tinta: tintaDe(fake) }); vestir(cx, fake, a); RESOL = antes;
  return c;
}
function previaItem(i, b) { return i.tipo === "parede" || i.tipo === "piso" ? previaTema(i) : i.tipo === "casa" ? previaDecor(i.id) : i.tipo === "cor" ? previaPet(b, { cor: i.id }) : previaPet(b, { [i.tipo]: i.id }, 1.1); }
