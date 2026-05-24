# @beeads/ui

Componentes UI do design system beeads — primitivos sobre `@base-ui/react`.

## Uso

```bash
pnpm add @beeads/ui @beeads/tokens
```

No `globals.css`:

```css
@import "@beeads/ui/styles.css";
```

Em `app/layout.tsx`:

```tsx
import { ThemeProvider, Toaster } from "@beeads/ui";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Em qualquer componente:

```tsx
import { Button, Card, Dialog, DialogContent, DialogTrigger } from "@beeads/ui";

<Dialog>
  <DialogTrigger render={(props) => <Button {...props}>Abrir</Button>} />
  <DialogContent>
    <p>Olá!</p>
  </DialogContent>
</Dialog>
```

## Componentes disponíveis

- **Forms:** Button, Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select, Field, Slider
- **Overlays:** Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu, AlertDialog, Command
- **Layout:** Card, Separator, Tabs, Accordion, Avatar, Breadcrumb, Pagination, Collapsible, ScrollArea
- **Feedback:** Badge, Skeleton, Alert, Spinner, Empty, Progress, Toaster (`toast()`)
- **Date:** Calendar, DatePicker
- **Utilities:** `cn()`, `ThemeProvider`, `useTheme()`

## API base-ui

Componentes que precisam de render-as-child (passar trigger customizado) usam o pattern `render` do base-ui (não `asChild`):

```tsx
<PopoverTrigger render={(props) => <Button {...props}>Abrir popover</Button>} />
```

Veja Storybook para variantes e exemplos.
