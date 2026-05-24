# Princípios de Design — beeads

## Identidade

**Caloroso, preciso, legível.**

- **Caloroso:** honey (#FFAE00) é a cor de accent. Aparece em CTAs, badges de destaque, focus rings, ativos. Não em superfícies grandes — não é cor de fundo.
- **Preciso:** monospace (Geist Mono) no corpo. Dá ar técnico, profissional, "ferramenta de trabalho". Não é fonte decorativa — é legível em listas, dados, configs.
- **Legível:** Fraunces nos títulos (display). Serif com personalidade, sem ser nostálgica. Comunica "feito com cuidado".

## Cores

### Brand
- **honey** (`--color-honey`) — accent único. Use pra: CTA principal, focus, link de destaque, badges importantes. NÃO use: fundo de tela, fundo de card, texto em parágrafo.
- **ink / paper** — preto e off-white quase puros. Bases neutras. Todo conteúdo deve ter contraste AA mínimo contra estes (>= 4.5:1).

### Semânticas
- **ok** (verde) — sucesso, confirmação, métrica subindo onde subir é bom
- **warn** (âmbar) — atenção, avisos não-críticos
- **err** (vermelho) — erro, falha, ação destrutiva, métrica subindo onde subir é ruim
- **info** (azul) — informação neutra, hints

Use semânticas só pra **estados**. Nunca como decoração ou variação de tema.

### Charts (paleta categórica)
5 cores fixas (`--color-chart-1` a `--color-chart-5`): honey, azul, verde, magenta, roxo. Use em ordem (chart-1 pra série mais importante, chart-2 pra segunda, etc.). Não invente cores novas — se precisar de 6+ séries, repete com transparência.

## Tipografia

### Famílias
- **Display (Fraunces)** — apenas em h1-h6, hero titles, números de destaque em KPIs, títulos de Cards.
- **Mono (Geist Mono)** — corpo, parágrafos, labels, dados, código. É a personalidade do beeads — embraza, não tenha medo.
- **Sans (system)** — fallback técnico (ARIA, hidden text, etc.). Raramente visível.

### Hierarquia
Hierarquia visual usa **peso e tamanho**, não cor.
- Títulos: Fraunces 600+
- Corpo: Geist Mono 400
- Labels: Geist Mono 500, smaller (`text-xs`/`text-sm`)
- Dados de destaque (KPI value): Fraunces 600+ em tamanho grande (`text-2xl`)

### Densidade
**Compacta.** Apps beeads são ferramentas de trabalho, não landing pages. `h-9` é o padrão de input/button (não `h-12`). Spacing entre seções: múltiplos de 4 (Tailwind padrão).

## Componentes

### Composição > customização
Em vez de um Button com 30 props, temos Button + `render={<Element/>}` (base-ui) ou children pra qualquer estrutura por baixo. Quem precisar de algo específico compõe primitivos.

### Tokens, nunca valores hardcoded
Se um componente novo precisa de uma cor, a cor vai em `@beeads/tokens` primeiro. **Proibido** hardcode (`#FFAE00`, `oklch(...)`) em arquivos de componente. Use classes (`bg-honey`) ou CSS vars (`var(--color-honey)`).

### Acessibilidade não é opcional
- Focus visible (anel honey de 2px, ring offset 2px) — sempre
- Suporte a keyboard (tab, arrow keys onde fizer sentido)
- ARIA correto (labels, descriptions, current page, expanded, etc.)
- Contraste AA mínimo (4.5:1 para texto corpo, 3:1 para texto grande/UI)

### Dark mode é first-class
Componentes referenciam **tokens semânticos** (`bg-card`, `text-fg`, `border-border`), não brand colors direto. Isso permite trocar `.dark` no html e tudo se adapta. Brand colors (honey, etc.) ficam visíveis em ambos os modos.

## Quando criar algo novo

Antes de adicionar um componente ao DS, perguntas:
1. Já existe um primitivo no DS que resolve isso composto? Geralmente sim.
2. Esse componente vai aparecer em **2+ apps**? Se não, é app-specific, fica no app.
3. A anatomia é estável (não vai mudar a cada uso)? Se não, não é primitivo — é layout custom.

## Voice & Tone (microcopy)

- **Direto.** "Salvar", não "Salvar alterações".
- **Português BR.** Não misturar inglês ("Save").
- **Ativo.** "Adicionar conta", não "Adição de conta".
- **Erros explicam o quê e o como.** Ruim: "Erro ao salvar". Bom: "Não foi possível salvar — verifique sua conexão e tente novamente."
- **Sem ! ou emojis decorativos.** Tom profissional, não casual.

## Charts & dataviz (princípios)

- **Cor não comunica significado primário.** Use labels, legendas e tooltips. Cor é diferenciador secundário (especialmente importante pra daltonismo).
- **Eixo Y começa em 0** salvo quando faz sentido (% deltas, comparações relativas) — não distorça escala.
- **Formate números pro contexto.** `R$ 1.234,56` em moeda; `1,2K` em compacto; `12.5%` em delta; nunca `1234.56789` cru.
- **KpiCard com `inverseDelta`** quando a métrica é "menor é melhor" (CPA, CPI, custo): delta negativo = verde (ok), positivo = vermelho (err).
- **Loading: skeletons que ocupam o espaço final** (não spinners genéricos centralizados).
- **Empty state com ação.** Não só "Sem dados" — diga o que fazer pra ter dados.

## O que NÃO fazemos

- Gradientes pesados (subtle gradient no AreaChart fill é ok)
- Sombras dramáticas (só `shadow-sm` ou `shadow-md`, raramente `shadow-lg` em overlays)
- Animações decorativas (transitions em estado: hover, focus, open/close — sim. Bouncing entrance — não)
- Mistura de fontes além de Fraunces + Geist Mono
- Cores saturadas além de honey
