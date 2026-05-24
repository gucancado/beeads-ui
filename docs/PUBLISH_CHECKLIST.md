# Publish checklist — passos manuais

## 1. Criar org no npm
- Acessar https://www.npmjs.com/org/create
- Criar org `beeads` (Free plan)
- Confirmar membership: `npm org ls beeads`

## 2. Login do npm CLI
```bash
npm login
```

## 3. Criar repo no GitHub
```bash
cd "c:/Users/gusta/Projetos/beeads-ui"
gh repo create gucancado/beeads-ui --public --source=. --remote=origin --description "Design system @beeads/* — tokens, fonts, ui, charts"
git push -u origin main
```

## 4. Criar token NPM e adicionar como secret do repo
- Em https://www.npmjs.com → Account → Access Tokens → Generate New Token (Granular: org `beeads`, write)
- Em https://github.com/gucancado/beeads-ui/settings/secrets/actions → New repository secret
  - Nome: `NPM_TOKEN`
  - Valor: o token gerado

## 5. Primeiro changeset + publish

```bash
cd "c:/Users/gusta/Projetos/beeads-ui"
pnpm changeset
# selecionar todos os 4 pacotes, minor, descrição: "Initial release of @beeads/* design system"
pnpm version-packages
# bumpa para 0.1.0, atualiza CHANGELOGs

pnpm release
# build + publica @beeads/tokens@0.1.0, @beeads/fonts@0.1.0, @beeads/ui@0.1.0, @beeads/charts@0.1.0
```

## 6. Verificar
```bash
npm view @beeads/ui
npm view @beeads/charts
```

## 7. Commit + push pós-release
```bash
git add .
git commit -m "chore: release @beeads/* 0.1.0"
git push
```
