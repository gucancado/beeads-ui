# Changesets

Cada PR que muda um pacote `@beeads/*` deve adicionar um changeset:

```bash
pnpm changeset
```

Selecione os pacotes afetados, escolha bump type (patch/minor/major), escreva descrição. Commite o `.md` gerado junto com o PR.

CI roda `changeset version` em merge pra `main`, gerando PR de release. Quando esse PR é merged, CI publica no npm.
