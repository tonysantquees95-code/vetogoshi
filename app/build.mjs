// Copia o jogo (HTML, CSS e JS puros) para a pasta www, que o Capacitor empacota no APK.
import { cpSync, rmSync, mkdirSync } from "node:fs";
rmSync("www", { recursive: true, force: true });
mkdirSync("www", { recursive: true });
cpSync("src", "www", { recursive: true });
import { writeFileSync } from "node:fs";
const n = Number(process.env.VITE_BUILD);
if (Number.isInteger(n) && n > 0) writeFileSync("www/versao.js", `window.VERSAO_BUILD = ${n};\n`);
console.log("www pronta");
