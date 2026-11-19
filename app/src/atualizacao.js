/* Atualização do Vetogoshi (padrão da suíte): confere a versão nova, baixa sozinho e a pessoa toca em Instalar. Só no app Android. */
var ATU = { app: "vetogoshi-android", repo: "tonysantquees95-code/vetogoshi", servidor: "https://venus-servidor.tonysantquees95.workers.dev", chave: "vetogoshi.atu.conferida" };
var AtuNativa = (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ? window.Capacitor.registerPlugin("Atualizador") : null;

function atuVersaoValida(o) {
  if (!o || typeof o.numero !== "number" || !Number.isInteger(o.numero) || typeof o.url !== "string") return null;
  var host = ""; try { var u = new URL(o.url); if (u.protocol !== "https:") return null; host = u.hostname; } catch (e) { return null; }
  if (!(host === "github.com" || host.endsWith(".github.com") || host.endsWith(".githubusercontent.com"))) return null;
  return { numero: o.numero, tag: String(o.tag || ""), notas: String(o.notas || "").slice(0, 300), tamanho: Number(o.tamanho) || 0, sha256: /^[0-9a-f]{64}$/i.test(o.sha256 || "") ? o.sha256.toLowerCase() : "", url: o.url };
}
async function atuProcurar() {
  try { var r = await fetch(ATU.servidor + "/atualizacao?app=" + ATU.app, { cache: "no-store" }); if (r.ok) { var v = atuVersaoValida(await r.json()); if (v) return v; } } catch (e) {}
  try {
    var g = await fetch("https://api.github.com/repos/" + ATU.repo + "/releases/latest", { cache: "no-store" });
    if (g.ok) {
      var o = await g.json(), m = /^v?1\.(\d+)$/.exec(o.tag_name || ""), a = (o.assets || []).find(function (x) { return /^Vetogoshi\.apk$/i.test(x.name || ""); });
      if (m && a) { var d = String(a.digest || ""); var v2 = atuVersaoValida({ numero: Number(m[1]), tag: o.tag_name, notas: o.body, tamanho: a.size, sha256: d.toLowerCase().indexOf("sha256:") === 0 ? d.slice(7) : "", url: a.browser_download_url }); if (v2) return v2; }
    }
  } catch (e) {}
  throw new Error("Não consegui consultar as atualizações agora.");
}
function atuMb(n) { return (n / 1048576).toFixed(1).replace(".", ",") + " MB"; }

/* Janelinha no visual do jogo: barra de andamento, "Depois" e "Instalar agora". */
function atuMostrar(v) {
  var timer = 0, fase = "baixando";
  function desenhar(pct, feitos, total, erro) {
    var barra = '<div class="atu-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (pct == null ? "" : pct) + '"><i style="width:' + (pct == null ? 33 : pct) + '%"></i></div>';
    var estado = fase === "baixando" ? "Baixando" + (pct != null ? " · " + pct + "%" : "…") + (total > 0 ? " (" + atuMb(feitos) + " de " + atuMb(total) + ")" : "")
      : fase === "pronta" ? "Pronta para instalar. O Android vai pedir a sua confirmação." : (erro || "Não consegui baixar agora.");
    folha("Atualização", '<p class="atu-txt">Versão 1.' + v.numero + ' disponível.' + (v.notas ? " " + v.notas.replace(/</g, "&lt;") : "") + "</p>" + barra + '<p class="atu-est">' + estado + '</p><div class="atu-bts"><button class="btn-res" id="atuDepois">Depois</button>' +
      (fase === "pronta" ? '<button class="btn-res primario" id="atuInstalar">Instalar agora</button>' : "") + (fase === "erro" ? '<button class="btn-res primario" id="atuDeNovo">Tentar de novo</button>' : "") + "</div>", function (el) {
      el.querySelector("#atuDepois").onclick = function () { clearInterval(timer); fechar(); };
      var i = el.querySelector("#atuInstalar"); if (i) i.onclick = function () { AtuNativa.instalarBaixada().catch(function (e) { fase = "erro"; desenhar(null, 0, 0, (e && e.message) || "Não consegui instalar agora."); }); };
      var n = el.querySelector("#atuDeNovo"); if (n) n.onclick = comecar;
    });
  }
  function comecar() {
    fase = "baixando"; desenhar(null, 0, v.tamanho, "");
    AtuNativa.baixarAtualizacao({ url: v.url, sha256: v.sha256, tamanho: v.tamanho }).catch(function (e) { clearInterval(timer); fase = "erro"; desenhar(null, 0, 0, (e && (e.message || e)) || ""); });
    clearInterval(timer);
    timer = setInterval(function () {
      AtuNativa.progressoAtualizacao().then(function (p) {
        var total = p.total > 0 ? p.total : v.tamanho, pct = total > 0 ? Math.min(100, Math.round((p.feitos / total) * 100)) : null;
        if (p.estado === "pronta") { clearInterval(timer); fase = "pronta"; desenhar(100, p.feitos, total, ""); }
        else if (p.estado === "erro") { clearInterval(timer); fase = "erro"; desenhar(null, 0, 0, p.erro); }
        else { var b = document.querySelector(".atu-barra i"), e2 = document.querySelector(".atu-est"); if (b && pct != null) b.style.width = pct + "%"; if (e2) e2.textContent = "Baixando · " + (pct == null ? "…" : pct + "%") + " (" + atuMb(p.feitos) + " de " + atuMb(total) + ")"; }
      }).catch(function () {});
    }, 500);
  }
  comecar();
}
async function atuConferir(manual) {
  if (!AtuNativa || !(window.VERSAO_BUILD > 0)) { if (manual) aviso("A atualização funciona no app instalado."); return; }
  try {
    var v = await atuProcurar(); try { localStorage.setItem(ATU.chave, String(Date.now())); } catch (e) {}
    if (v.numero > window.VERSAO_BUILD) atuMostrar(v); else if (manual) aviso("Você já está na versão mais nova.");
  } catch (e) { if (manual) aviso(e.message); }
}
setTimeout(function () {
  var ult = 0; try { ult = Number(localStorage.getItem(ATU.chave)) || 0; } catch (e) {}
  if (!ult || Date.now() - ult >= 6 * 3600000 || Date.now() < ult) atuConferir(false);
}, 3000);
