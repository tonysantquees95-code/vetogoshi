// Confere que todos os arquivos de script têm sintaxe válida e que o index.html carrega cada um deles.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const scripts = readdirSync("src").filter((f) => f.endsWith(".js"));
test("sintaxe dos scripts", () => { for (const f of scripts) execFileSync(process.execPath, ["--check", `src/${f}`]); });
test("index.html carrega os scripts do jogo", () => {
  const html = readFileSync("src/index.html", "utf8");
  for (const f of ["audio.js", "arte.js", "casa.js", "vetogoshi.js", "jogos.js"]) assert.ok(html.includes(`src="${f}"`), f);
});
test("itens da loja têm id único e desenho", () => {
  const casa = readFileSync("src/casa.js", "utf8");
  const ids = [...casa.matchAll(/\{ id: "([a-z0-9-]+)", tipo:/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, "id repetido no catálogo");
});
