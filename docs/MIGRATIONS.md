# Status das migrações (apps consumidores)

Após publicar `@beeads/*@0.1.0` no npm (ver `PUBLISH_CHECKLIST.md`), execute as migrações em cada app:

| App | Status | Arquivo de migração | Estratégia |
|---|---|---|---|
| agentes-beeads | preparado | `c:/Users/gusta/Projetos/agentes-beeads/MIGRATION_TO_BEEADS_UI.md` | Completa (3 primitivos locais → @beeads/ui) |
| beeads-bloquim | preparado | `c:/Users/gusta/Projetos/beeads-bloquim/MIGRATION_TO_BEEADS_UI.md` | Progressiva — tokens/fontes/Toaster/Button piloto; primitivos Radix locais mantidos |
| beeads-central-de-dados | preparado | `c:/Users/gusta/Projetos/beeads-central-de-dados/MIGRATION_TO_BEEADS_UI.md` | Completa — Tailwind v3 preset, identidade honey, charts via @beeads/charts |

Cada arquivo contém passos auto-suficientes. Quando publicado, rodar os passos sequencialmente.
