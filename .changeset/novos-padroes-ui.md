---
"@beeads/ui": minor
---

Novos padrões de plataforma no DS:

- **Sidebar fixa:** `sticky top-0 h-svh` por default no desktop — a barra não acompanha mais o scroll da página. Layouts confinados (sidebar dentro de caixa menor que a viewport) sobrescrevem com `<Sidebar className="h-full" />`.
- **Sidebar mobile:** abaixo de 768px (configurável via `mobileBreakpoint`) vira off-canvas (Sheet); novo export `SidebarTrigger` (hamburger pro topbar); nav item fecha o menu ao navegar; labels novos `openMenu`/`mobileMenu`.
- Novo hook `useIsMobile(breakpoint = 768)`.
- `SheetContent` ganha `hideClose`.
- **Caixa baixa:** strings default agora em lowercase ("anterior", "próxima", "escolher data", "carregando", …); sr-only "Close"/"More" viram "fechar"/"mais"; `SidebarSectionLabel` troca `uppercase` por `lowercase`.
- **DatePicker** exibe `dd/MM/yyyy` (era "8 de julho de 2026").
- **Dialog/AlertDialog:** conteúdo alto rola internamente (`max-h-[calc(100dvh-2rem)] overflow-y-auto`) em vez de estourar a viewport.
