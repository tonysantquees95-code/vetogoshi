# Manual — Vetogoshi

> Escrito para a Vetorial Tech. Não contém segredos: só diz ONDE ficam. Visão de todos os apps: Manual da Vetorial Tech (Drive).

Bichinho virtual (HTML/CSS/JS puros, sem bundler). Android.

## Onde fica cada coisa
- `app/src/`: `vetogoshi.js` (simulação), `arte.js`, `casa.js`, `jogos.js` (minijogos), `audio.js`. `nativo/`: Android.
- Pendente: tela "O que há de novo", apresentação com termos, teste visual e instalador de Windows.


## Como voltar atrás se algo quebrar
- No GitHub: aba **Actions** mostra o fluxo vermelho; **Code › Commits** mostra o commit culpado; abra o commit e toque em **⋯ › Revert** (cria um commit novo que desfaz o anterior).
- O número da versão sempre sobe: a versão boa volta como número novo, nunca se republica um número antigo.
- Banco de dados e dados dos usuários não voltam com o código (migrações só andam para frente).

## Movimentações importantes
Uma linha por mudança que valha lembrar (a mais nova em cima). O Painel Dev também mostra os últimos commits automaticamente.

| Data | O que mudou | Onde |
| --- | --- | --- |
| 2026-11-27 | Manual criado | `MANUAL.md` |
