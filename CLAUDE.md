# Vetogoshi (Android; Windows e web depois) — notas para quem mexe no código

- Jogo de bichinho virtual em HTML/CSS/JS puros (sem bundler). Código em `app/src/`: `vetogoshi.js` (simulação, telas, loja), `arte.js` (desenho dos bichinhos e cenas), `casa.js` (cômodos, enfeites, roupas, cores, paredes), `jogos.js` (minijogos), `audio.js`.
- `cd app && npm run build` copia `src/` para `www/`; o Capacitor empacota. `npm test` confere sintaxe e catálogo.
- O APK só compila no GitHub Actions (`.github/workflows/app.yml`): `npx cap add android`, ajusta o manifesto (só em pé, permissão de avisos) e assina com a chave guardada no servidor da Vênus. O repositório precisa estar em `REPOS_PERMITIDOS` (`vetorial-servidor/servidor/src/ci/assinatura.js`).
- Avisos (fome, sede, sono...): no Android usam `@capacitor/local-notifications`, agendados ao sair do app (`agendarNativo`); na web usam a Notification API enquanto a aba está viva.
- Minijogos: cada um é uma função em `jogos.js` registrada em `JOGOS`/`NOMES`; `ctl` define os botões (ou `{}` para jogos de toque/arrasto). Jogos altos ficam em `ALTOS` (altura lógica `AJ`).
- Telinhas e ícones novos seguem o visual do próprio jogo (cantos arredondados, cores do tema, traço fino nos ícones).
- Pendente (seguir o padrão da suíte Vetorial): tela "O que há de novo", apresentação da primeira abertura com termos, teste visual em 7 tamanhos, instalador do Windows.

## Entre as barras do Android (regra dos departamentos)
- O app fica ENTRE a barra de notificações e a barra de navegação (fixas ou não): nada pode ficar embaixo delas. No Android nativo isso vem de `MainActivity` (margem do tamanho das barras); confira no Visualizador em todos os tamanhos antes de gerar o APK.

## Publicação e atualização (regra dos departamentos)
- Todo APK finalizado vai direto para o Painel Dev (ver e baixar), e o app precisa estar listado lá.
- O app se atualiza por dentro (verificar → barra de download → Instalar), igual aos outros da suíte. O Vindex enxerga todos os apps.

## Teste de segurança (igual em todos os apps da suíte)
- `app/teste/seguranca.test.mjs` roda junto com os outros testes e na publicação: se falhar, a publicação para. Confere o repositório inteiro: segredo escrito no código (chaves, tokens, senhas), arquivo que nunca pode ser versionado (.env, chaves de assinatura), CSP do Tauri sem `unsafe-eval`/curinga, manifesto do Android (debug, tráfego http, componente exposto sem permissão, `QUERY_ALL_PACKAGES`), `eval`, HTML montado com texto (`innerHTML`), endereço `http://` fora da máquina local, segredo no log, HTTPS desligado e WebView com acesso perigoso.
- Exceção justificada = uma linha em `seguranca.permitidos.json` (regra, arquivo, trecho e MOTIVO de verdade); sem motivo, não vale. Texto digitado pela pessoa ou vindo de site/servidor nunca entra em HTML sem escapar (`textContent` ou `esc()`).
- O arquivo é o mesmo em todos os apps: mudou uma regra? Mude em todos. Achou uma brecha nova? Escreva primeiro um teste que a reproduz.
- Vetogoshi: o nome do bichinho (digitado) passa por `esc()`; `teste/seguranca-vetogoshi.test.mjs` confere.
