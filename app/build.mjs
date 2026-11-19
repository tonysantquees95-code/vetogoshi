// Copia o jogo (HTML, CSS e JS puros) para a pasta www, que o Capacitor empacota no APK.
import { cpSync, rmSync, mkdirSync } from "node:fs";
rmSync("www", { recursive: true, force: true });
mkdirSync("www", { recursive: true });
cpSync("src", "www", { recursive: true });
console.log("www pronta");
