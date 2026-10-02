---
version: alpha
name: Controle de Estoque (sugestao-front)
description: Identidade visual sóbria e acessível, derivada do Padrão Digital de Governo (gov.br) e conforme e-MAG/WCAG AA.
colors:
  primary: '#1351b4'
  primary-dark: '#0c326f'
  on-primary: '#ffffff'
  text: '#333333'
  text-muted: '#555555'
  background: '#ffffff'
  surface: '#f8f8f8'
  hover: '#e8eef8'
  border: '#888888'
  border-light: '#dddddd'
  danger: '#b0001a'
  on-danger: '#ffffff'
  danger-bg: '#fde8ea'
  success: '#146f1f'
  success-bg: '#e3f5e1'
  warning: '#8a5a00'
  warning-bg: '#fff5c2'
  info-bg: '#e5eefb'
  focus: '#c2850c'
  footer-bg: '#071d41'
  on-footer: '#ffffff'
typography:
  h1:
    fontFamily: Rawline, Raleway, system-ui, sans-serif
    fontSize: 1.75rem
    fontWeight: 700
    lineHeight: 1.25
  h2:
    fontFamily: Rawline, Raleway, system-ui, sans-serif
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  body-md:
    fontFamily: Rawline, Raleway, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Rawline, Raleway, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Rawline, Raleway, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.5
  code:
    fontFamily: ui-monospace, Menlo, Consolas, monospace
    fontSize: 0.875rem
rounded:
  sm: 6px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.pill}'
    padding: 0 24px
    height: 44px
  button-primary-hover:
    backgroundColor: '{colors.primary-dark}'
    textColor: '{colors.on-primary}'
  button-secondary:
    backgroundColor: '{colors.background}'
    textColor: '{colors.primary}'
    rounded: '{rounded.pill}'
    padding: 0 24px
    height: 44px
  button-secondary-hover:
    backgroundColor: '{colors.hover}'
    textColor: '{colors.primary}'
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.on-danger}'
    rounded: '{rounded.pill}'
    height: 44px
  input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text}'
    rounded: '{rounded.sm}'
    padding: 8px 12px
    height: 44px
  alert-error:
    backgroundColor: '{colors.danger-bg}'
    textColor: '{colors.text}'
    rounded: '{rounded.sm}'
    padding: 14px 16px
  alert-success:
    backgroundColor: '{colors.success-bg}'
    textColor: '{colors.text}'
    rounded: '{rounded.sm}'
    padding: 14px 16px
  alert-warning:
    backgroundColor: '{colors.warning-bg}'
    textColor: '{colors.text}'
    rounded: '{rounded.sm}'
    padding: 14px 16px
  badge-success:
    backgroundColor: '{colors.success-bg}'
    textColor: '{colors.success}'
    rounded: '{rounded.pill}'
    padding: 2px 10px
    typography: '{typography.body-sm}'
  badge-warning:
    backgroundColor: '{colors.warning-bg}'
    textColor: '{colors.warning}'
    rounded: '{rounded.pill}'
    padding: 2px 10px
    typography: '{typography.body-sm}'
  sidebar:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    width: 256px
  footer:
    backgroundColor: '{colors.footer-bg}'
    textColor: '{colors.on-footer}'
  notification-info:
    backgroundColor: '{colors.info-bg}'
    textColor: '{colors.text}'
    rounded: '{rounded.sm}'
  table-header:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
  text-muted:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text-muted}'
---

## Overview

Sistema interno de órgão público: o visual existe para **não atrapalhar**. Prioridade é
legibilidade, previsibilidade e conformidade com o e-MAG (Modelo de Acessibilidade em Governo
Eletrônico) e WCAG 2.1 AA. A paleta e a tipografia derivam do Padrão Digital de Governo (gov.br),
o que dá familiaridade imediata ao servidor público sem copiar o Design System oficial inteiro.

Princípios:

1. **Cor nunca é o único sinal.** Erro = borda mais grossa + ícone + texto. Link = sublinhado.
   Situação de estoque = badge com texto, não só cor.
2. **Tudo em `rem`.** A barra de acessibilidade escala `html { font-size }`; qualquer `px` em
   componente quebra o ajuste de fonte.
3. **Tokens são a única fonte de cor.** Nenhum hex fora de `src/assets/styles/_tokens.scss`.
   O Stylelint bloqueia isso (`npm run lint:style`).
4. **Alto contraste é um tema, não uma gambiarra.** `.high-contrast` redefine os mesmos tokens;
   componentes não sabem que ele existe.
5. **Sem ornamento.** Zero gradiente, zero animação decorativa, sombra apenas onde há sobreposição
   real (cabeçalho, menu mobile, notificações).

Este arquivo é a versão **normativa** do design system. Os tokens em `_tokens.scss` devem refletir
exatamente os valores daqui. Mudou aqui → mude lá → rode `npm run design:lint`.

## Colors

- **Primary (#1351b4)** — azul gov.br. Ações principais, links, item ativo do menu. Contraste
  sobre branco: 7,2:1.
- **Primary dark (#0c326f)** — hover/active da ação principal.
- **Text (#333333)** e **Text muted (#555555)** — corpo e texto secundário. Muted mantém 7,5:1
  sobre branco; nunca use cinza mais claro para texto.
- **Background (#ffffff)** / **Surface (#f8f8f8)** — página e áreas de apoio (menu lateral,
  cabeçalho de tabela). Diferença sutil de propósito; não use surface para "cartões" soltos.
- **Hover (#e8eef8)** — único tom de hover para itens de lista, botão secundário e links de menu.
- **Border (#888888)** — bordas de campos de formulário (3,5:1, atende o mínimo de componentes UI).
  **Border light (#dddddd)** — divisórias de tabela e separadores estruturais, nunca em campos.
- **Danger (#b0001a)** — erros e ação destrutiva. **Danger bg (#fde8ea)** — fundo de alerta.
- **Success (#146f1f)** / **Warning (#8a5a00)** — texto de badge e borda de alerta; sempre
  acompanhados dos respectivos `-bg` quando usados como preenchimento.
- **Focus (#c2850c)** — âmbar do anel de foco (3px). Escolhido para contrastar tanto com azul quanto
  com branco e vermelho; não reutilize para outra finalidade.
- **Footer (#071d41)** — azul-marinho institucional; único bloco escuro da interface.

### Tema de alto contraste

Preto absoluto como fundo, branco para texto e bordas, amarelo (#ffff00) para ações e ciano
(#00ffff) para foco. Imagens recebem `grayscale(100%) contrast(120%)`. Sombras são removidas.

## Typography

Família **Rawline** (a mesma do gov.br) com fallback Raleway → system-ui. A fonte não é
empacotada no projeto hoje; se for adicionada, use `font-display: swap` e inclua apenas os pesos
400, 600 e 700.

Escala (em `rem`, base 16px):

- `h1` 1.75rem / 700 / 1.25 — um por página, sempre o primeiro foco após navegar.
- `h2` 1.375rem / 700 / 1.25 — seções da página e título do resumo de erros.
- `body-md` 1rem / 400 / 1.5 — corpo, células de tabela, campos.
- `body-sm` 0.875rem / 400 — dicas de campo, subtítulo do cabeçalho, badges, barra de
  acessibilidade. **Nunca** abaixo disso para texto legível.
- `label` 1rem / 600 — rótulos de campo, `<th>`, nome do usuário logado.

Peso 600 marca rótulo/ênfase; 700 só em títulos e item ativo do menu. Não use itálico.

## Layout

Shell fixo: barra de acessibilidade → cabeçalho → `[menu lateral 16rem | conteúdo]` → rodapé.
Notificações flutuam no canto inferior direito (`z-index 1000`).

- **Espaçamento** em escala de 4px: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64.
  Padrões: 1.25rem entre campos, 1.5rem abaixo de cabeçalho de página, 2rem/2.5rem de padding do
  conteúdo em desktop.
- **Larguras máximas**: formulário 32rem (56rem na variante larga), texto corrido 48rem
  (`.prose`), notificação 28rem.
- **Breakpoints**: `48em` (768px) ativa grid de 2 colunas em formulários e listas de detalhes;
  `64em` (1024px) o menu lateral deixa de sobrepor o conteúdo.
- **Área de toque** mínima de 2.75rem (44px) em todo controle interativo; 2.25rem para botões
  compactos dentro de tabelas e cabeçalho; 2rem só na barra de acessibilidade.

## Elevation

Três sombras, todas utilitárias — nunca decorativas:

- `shadow-sm` `0 1px 4px rgb(0 0 0 / 8%)` — cabeçalho, separa do conteúdo rolável.
- `shadow-md` `0 0.25rem 0.75rem rgb(0 0 0 / 20%)` — notificações (flutuam sobre a página).
- `shadow-lg` `0.25rem 0 1rem rgb(0 0 0 / 20%)` — menu lateral quando sobrepõe o conteúdo em
  telas pequenas.

Nenhuma outra superfície tem sombra. Em alto contraste todas viram `none`.

## Shapes

- **6px** (`--radius`) — campos, alertas, resumo de erros, botões da barra de acessibilidade.
- **Pílula** (`--radius-pill`) — botões de ação e badges. É o que diferencia "ação" de "campo".
- **Círculo** (`--radius-full`, 50%) — botões apenas-ícone (alternar menu, ícone de erro). Não
  consta no front matter porque o spec só aceita px/rem/em.

Bordas: 1px padrão, 2px para campo inválido e linha do `thead`, 3px para anel de foco e resumo de
erros, 0.375rem para a faixa lateral de alertas e notificações.

## Components

- **Botão primário** — azul sólido, pílula, 44px de altura, peso 600. Um por região de ação.
- **Botão secundário** — borda azul 2px, fundo branco. Hover troca o fundo por `hover`.
- **Botão perigo** — vermelho sólido; só para exclusão, sempre com confirmação.
- **Campo** (`.field`) — rótulo em cima (600), dica abaixo do rótulo (`body-sm` muted), input
  44px com borda 1px `border`, erro abaixo do input com ícone circular vermelho + texto 600.
  Inválido: borda 2px vermelha e rótulo vermelho. `aria-describedby` liga dica e erro.
- **Resumo de erros** — caixa com borda 3px vermelha, título h2, lista de links que focam o campo.
  Recebe foco ao submeter com erros.
- **Alerta inline** — faixa lateral de 0.375rem na cor semântica, fundo `-bg` correspondente.
- **Notificação** — mesmo padrão do alerta, flutuante, com botão fechar 32px. Erros não somem
  sozinhos.
- **Badge** — pílula com borda 1px e texto 600 na cor semântica, fundo `-bg`. Sempre com texto.
- **Tabela** — `caption` visível, `thead` com fundo `surface` e borda 2px, linhas com divisória
  `border-light`, colunas numéricas alinhadas à direita, `<th scope="row">` no nome do item.
- **Menu lateral** — fundo `surface`, link com borda esquerda 0.25rem transparente; ativo fica
  azul com borda azul e peso 700.
- **Barra de acessibilidade** — `body-sm`, fundo `surface`, atalhos como links e controles de
  fonte/contraste como botões 32px com `aria-pressed`.

## Do's and Don'ts

**Faça**

- Use `var(--token)` para toda cor, tamanho de fonte, sombra, raio e z-index.
- Mantenha `:focus-visible` com o anel âmbar de 3px; não troque por `box-shadow`.
- Sublinhe links em texto corrido; no menu, sublinhe no hover.
- Teste cada tela com alto contraste ligado e fonte em +2 antes de abrir PR.
- Mantenha `<h1>` único e descritivo; o `AppTitleStrategy` usa o mesmo texto no `<title>`.

**Não faça**

- Não introduza hex, `rgb()` ou `px` de fonte fora de `_tokens.scss` (o lint bloqueia).
- Não use gradientes, blur, animações de entrada ou ícones coloridos sem texto.
- Não use cinza mais claro que `#555555` para texto nem `#888888` para borda de campo.
- Não dependa de `placeholder` como rótulo.
- Não crie um "card" com sombra para agrupar conteúdo; use título h2 e espaçamento.
- Não adicione componentes de UI de terceiros (Material, PrimeNG) sem revisar contraste, foco e
  tamanho de toque contra este documento.
