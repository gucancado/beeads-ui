---
"@beeads/ui": minor
---

- dist/classlist.txt: manifesto estável de classes pra scan do Tailwind, exportado via `./classlist.txt`
- styles.css agora injeta `@source "./classlist.txt"` em vez de depender de scan dos bundles JS
- integração Tailwind v4 mais robusta, especialmente com Turbopack
