# NovaPlayer

Player local de video e audio feito com React + Vite para revisar midia no navegador sem enviar arquivos para servidor.

## O que o app faz

- Importa arquivos locais de video e audio por clique ou drag and drop.
- Reproduz video com controles customizados e preview na timeline.
- Reproduz audio com interface dedicada.
- Permite ajustar velocidade entre `0.5x` e `4x`.
- Faz salto rapido de `5s` para frente e para tras.
- Ativa loop dos ultimos `5s` para revisar trechos curtos.
- Suporta fullscreen no player de video.
- Suporta modo flutuante com `Picture-in-Picture` ao trocar de aba.
- Mantem os arquivos no navegador usando `URL.createObjectURL`.

## Atalhos de teclado

### Video

- `Espaco`: play / pause
- `Seta Esquerda`: voltar 5s
- `Seta Direita`: avancar 5s
- `Seta Cima`: aumentar velocidade
- `Seta Baixo`: diminuir velocidade
- `R`: resetar velocidade para `1x`
- `F`: entrar ou sair de fullscreen
- `L`: ligar ou desligar loop dos ultimos `5s`
- `M`: mutar ou desmutar

### Audio

- `Espaco`: play / pause
- `Seta Esquerda`: voltar 5s
- `Seta Direita`: avancar 5s
- `Seta Cima`: aumentar velocidade
- `Seta Baixo`: diminuir velocidade
- `R`: resetar velocidade para `1x`
- `L`: ligar ou desligar loop dos ultimos `5s`
- `M`: mutar ou desmutar

## Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Vitest`
- `Testing Library`
- `ESLint`
- `Prettier`
- `Husky` + `lint-staged`

## Requisitos

- `Node.js`
- `npm`

## Rodando localmente

```bash
npm install
npm run dev
```

Abra a URL mostrada pelo Vite, normalmente `http://localhost:5173`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
npm run test
```

## Testes e qualidade

O projeto possui:

- testes com `Vitest`
- lint com `ESLint`
- formatacao com `Prettier`
- hook de pre-commit com `Husky` e `lint-staged`

## Privacidade

Os arquivos selecionados sao processados localmente no navegador. O app nao faz upload da midia para backend.

## Deploy

Existe configuracao de build para `Netlify` em [`netlify.toml`](./netlify.toml).
