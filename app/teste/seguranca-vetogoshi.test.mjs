// O nome do bichinho é digitado pela pessoa: nunca pode entrar em HTML sem esc() (senão um nome com <img onerror=…> roda código).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const fonte = readFileSync(new URL("../src/vetogoshi.js", import.meta.url), "utf8");
test("nome do bichinho e dados do cemitério só entram em HTML com esc()", () => {
  const cru = fonte.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => /\$\{\s*((b|r|bicho|estado\.bicho|estado\.reserva\[\d\])\.nome|c\.(especie|causa|idade))\s*\}|<strong>\$\{c\.nome\}/.test(l) && /innerHTML|folha\(|=>\s*`<|`<[a-z]/.test(l) && !/textContent|notificar|titulo:|aria-label="\$\{esc/.test(l));
  assert.deepEqual(cru.map(([n, l]) => `${n}: ${l.trim().slice(0, 90)}`), []);
});
test("esc() existe e escapa as aspas e os sinais de HTML", () => {
  const m = /const esc = [^\n]+/.exec(fonte);
  assert.ok(m);
  const esc = new Function(m[0] + "; return esc;")();
  assert.equal(esc(`<img src=x onerror="a">'`), "&lt;img src=x onerror=&quot;a&quot;&gt;&#39;");
});
