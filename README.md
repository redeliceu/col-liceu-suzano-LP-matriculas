# LP Colégio Liceu Suzano — Matrículas 2027

Landing page de captação (hero com formulário, tela `/sucesso` e rodapé), na mesma base da versão `simple-lp` das LPs Itaquá, Dó Ré Mi e Pequeno Príncipe.

Layout fiel ao Figma `LP Colégio Liceu` (quadros "LP - Colégio Liceu Suzano web" 1440×1024 e "mobile" 440×956).

## Stack

Vite + React + TypeScript + Tailwind 3 (só a base) + CSS próprio em `src/styles/`. Fonte Figtree via `@fontsource-variable/figtree`.

## Rodar

```bash
npm install
cp .env.example .env   # preencher VITE_API_URL e VITE_WEBHOOK_URL
npm run dev
npm run build
```

## Responsivo

- **≥ 1024px:** quadro web. Todas as medidas são as do Figma × `--u`, que escala pela largura (1440) e pela altura útil (tela − 144px do rodapé ÷ 880). O hero sempre cabe na tela.
- **< 1024px:** quadro mobile, medidas × `--m` (largura ÷ 440, altura ÷ 625, entre 0,8 e 1,45). Entre 768 e 1023px usa o rodapé de desktop.
- **< 768px:** rodapé empilhado do quadro mobile.
- O card do formulário é o mesmo nos dois quadros (mobile = web × 0,659), com um único fator `--c`.

## Arquivos

- `src/App.tsx` — hero, formulário e envio do lead.
- `src/styles/landing.css` — hero, card, WhatsApp e rodapé.
- `src/styles/success.css` / `src/components/SuccessScreen.tsx` — tela `/sucesso`.
- `src/lib/contact.ts` — WhatsApp, Instagram e endereço da unidade.
- `src/lib/tracking.ts` — evento `Lead` (Meta) e `lead_matricula` (GTM) após envio confirmado.
- `index.html` — local do GTM e do Meta Pixel (IDs ainda não definidos).
