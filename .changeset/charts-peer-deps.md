---
"@beeads/charts": major
---

`@beeads/tokens` and `@beeads/ui` are now **peerDependencies** instead of regular dependencies. This ensures the consuming app's single installed copy of the design system is used, preventing duplicate/conflicting `@beeads/tokens` instances (and mismatched CSS variables) when an app uses both `@beeads/charts` and `@beeads/ui`.

**Migration:** ensure your app has `@beeads/tokens` and `@beeads/ui` in its own `dependencies` (apps using `@beeads/charts` already install these). `recharts` remains a direct dependency (DS standardizes on `recharts@^2.x`).
