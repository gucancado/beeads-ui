# Novos padrões de plataforma — beeads-ui

Data: 2026-07-08. Escopo: `@beeads/ui`, `@beeads/charts`, docs e Storybook. Consumidores: bloquim.beeads.com.br, painel.beeads.com.br, agentes.beeads.com.br.

Cinco padrões transversais entram no DS. O DS entrega os primitivos + convenções documentadas; a adoção nas telas de cada app é trabalho de follow-up nos repos consumidores.

## Padrão 1 — caixa baixa por padrão

**Regra:** todo texto de sistema (labels, títulos, botões, placeholders, presets) usa caixa baixa — "visão geral", não "Visão geral". Exceções: nomes próprios (WhatsApp, Google), siglas (CPA, ROAS, CTR), conteúdo digitado pelo usuário e código.

**Decisão de mecanismo:** convenção + strings default do DS em lowercase. **Sem** `text-transform: lowercase` global — transform CSS destruiria nomes próprios, siglas e dados de usuário. Única exceção: `SidebarSectionLabel`, que já aplicava transform (`uppercase`) e passa a aplicar `lowercase` (conteúdo é sempre label de seção de navegação, controlado pelo app).

Mudanças concretas:

| Arquivo | Mudança |
|---|---|
| `ui/pagination.tsx` | "Anterior"→"anterior", "Próxima"→"próxima", aria-labels idem, sr-only "More"→"mais" |
| `ui/date-picker.tsx` | placeholder "Escolher data"→"escolher data" |
| `ui/theme-toggle.tsx` | aria/sr-only "Mudar para tema claro/escuro"→lowercase, "Trocar tema"→"trocar tema" |
| `ui/spinner.tsx` | "Carregando"→"carregando" |
| `ui/dialog.tsx`, `ui/sheet.tsx` | sr-only "Close"→"fechar" (fix pt-BR junto) |
| `ui/breadcrumb.tsx` | sr-only "More"→"mais" |
| `ui/sidebar.tsx` | aria-label default "Navegação principal"→"navegação principal"; `SidebarSectionLabel` `uppercase`→`lowercase` |
| `charts/period-picker.tsx` | presets "Últimos 7 dias"→"últimos 7 dias" etc. (5 labels) |
| `charts/filter-bar.tsx` | placeholder "Buscar…"→"buscar…" |
| Stories | copy visível de demonstração em lowercase (mantém siglas/nomes próprios) |
| `docs/PRINCIPLES.md` | regra nova em Voice & Tone com exceções |

## Padrão 2 — responsividade: mobile, notebook, ultrawide

**Alvos declarados:** mobile (<768px), notebook (1024–1536px), monitor ultrawide (≥1700px = breakpoint `3xl`, já existente nos tokens mas nunca consumido).

Mudanças concretas:

1. **Hook `useIsMobile(breakpoint = 768)`** novo em `@beeads/ui` (matchMedia; `false` no SSR/primeiro render pra evitar hydration mismatch).
2. **Sidebar mobile off-canvas:** quando `isMobile`, a `Sidebar` renderiza como Sheet (off-canvas da esquerda, `bg-sidebar`, sempre expandida) controlado por `openMobile`/`setOpenMobile` no contexto. Novo export **`SidebarTrigger`** (botão hamburger pro topbar do app: abre o sheet no mobile, colapsa/expande no desktop). `SidebarNavItem` fecha o sheet automaticamente ao clicar (navegou → fecha). `SidebarLabels` ganha `openMenu` ("abrir menu"). `SidebarProvider` ganha prop `mobileBreakpoint?: number`.
3. **PeriodPicker responsivo:** no mobile, presets empilhados acima do calendário (`flex-col`) e `numberOfMonths={1}`; desktop mantém layout atual.
4. **Dialog/AlertDialog:** `max-h-[calc(100dvh-2rem)] overflow-y-auto` (conteúdo longo não estoura viewport de celular).
5. **KpiGrid:** ganha `3xl:grid-cols-6` (dashboards escalam em ultrawide em vez de esticar 4 cards).
6. **`docs/PRINCIPLES.md`:** seção nova "Responsividade" com os 3 alvos e as regras de layout pros apps (mobile-first; sidebar off-canvas via DS; tabelas largas em `overflow-x-auto`; leitura com `max-w` centrado em ultrawide; dashboards fluidos que escalam colunas em `3xl`).

## Padrão 3 — datas dd/mm/aaaa, horas hh:mm ou hh:mm:ss

**Regra:** datas na UI sempre `dd/mm/aaaa`; horas sempre `hh:mm` ou `hh:mm:ss`. Em eixos densos de gráfico, admite-se `dd/mm` (ano inferido do contexto do período).

Mudanças concretas:

1. **`formatters` (charts/lib/chart-theme.ts)** ganham formatters de data/hora (aceitam `Date | string ISO | epoch ms`, via date-fns):
   - `date` → `08/07/2026` · `dateShort` → `08/07` (eixos densos) · `time` → `14:30` · `timeSeconds` → `14:30:05` · `dateTime` → `08/07/2026 14:30`
2. **DatePicker:** `format(value, "PPP")` → `"dd/MM/yyyy"`.
3. **PeriodPicker trigger:** `"d MMM – d MMM y"` → `"dd/MM/yyyy – dd/MM/yyyy"`.
4. **`xFormatter` prop opcional** em LineChart/AreaChart/BarChart/MultiLineChart: formata ticks do eixo X **e** o label do tooltip (thread por `tooltipRenderer`). Sem `xFormatter`, comportamento atual inalterado.
5. **`docs/PRINCIPLES.md`:** regra de formatos na seção de charts/microcopy.

## Padrão 4 — sidebar fixa (não acompanha o scroll)

A `Sidebar` (desktop) ganha `sticky top-0 h-svh` por default: numa página que rola, a barra permanece fixa e só o conteúdo rola. Compatível com o layout flex atual dos apps (`h-screen` + `overflow` próprio continuam funcionando; sticky vira no-op nesses casos). Story do Sidebar demonstra a receita de layout com scroll de página.

## Padrão 5 — rodapé da sidebar: nome, e-mail, configurações, sair

O `SidebarFooter` do DS **já implementa** exatamente o padrão do Bloquim: avatar + nome + e-mail, botão de configurações (dropdown `settingsItems`), botão de sair (`onLogout`), opcional `onProfileClick`. Nenhuma mudança de código; o padrão vira norma documentada em `PRINCIPLES.md`: todo app beeads renderiza `SidebarFooter` com `user={{ name, email }}`, `settingsItems` e `onLogout`. (Botão de configurações só some se o app não passar itens — passar é obrigatório pela norma.)

## Versionamento

- `@beeads/ui` → **minor** (0.6.0): useIsMobile, Sidebar mobile/sticky/trigger, strings lowercase, DatePicker dd/MM/yyyy. Changeset destaca as mudanças visuais/comportamentais (SectionLabel lowercase, sidebar sticky, formato de data).
- `@beeads/charts` → **minor** (0.4.0): formatters de data/hora, xFormatter, PeriodPicker responsivo + formato + presets lowercase, FilterBar lowercase, KpiGrid 3xl.
- `@beeads/tokens` → sem mudança (breakpoint 3xl já existe em theme.css + preset.cjs + index.ts).

## Testes e Storybook

- Testes novos: `useIsMobile` (matchMedia mock), Sidebar mobile (trigger abre sheet, nav item fecha), formatters de data/hora.
- Stories: copy em lowercase; story de Sidebar com variante mobile + layout sticky; Charts story demonstra `xFormatter` com datas dd/mm.

## Fora de escopo

- Adoção dos padrões nas telas dos 3 apps consumidores (follow-up em cada repo, após release).
- Migração de textos dos apps pra lowercase (é conteúdo dos apps).
- Tailwind v3: nada a fazer — preset já expõe `3xl`.
