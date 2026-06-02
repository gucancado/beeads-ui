/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        honey: "var(--color-honey)",
        "honey-soft": "var(--color-honey-soft)",
        "honey-deep": "var(--color-honey-deep)",
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        "paper-2": "var(--color-paper-2)",
        ok: "var(--color-ok)",
        warn: "var(--color-warn)",
        err: "var(--color-err)",
        info: "var(--color-info)",
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        card: {
          DEFAULT: "var(--color-card)",
          fg: "var(--color-card-fg)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          fg: "var(--color-muted-fg)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        accent: {
          DEFAULT: "var(--color-accent)",
          fg: "var(--color-accent-fg)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          fg: "var(--color-primary-fg)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          fg: "var(--color-secondary-fg)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          fg: "var(--color-destructive-fg)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--color-sidebar) / <alpha-value>)",
          foreground: "hsl(var(--color-sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--color-sidebar-border) / <alpha-value>)",
          accent: "hsl(var(--color-sidebar-accent) / <alpha-value>)",
          "accent-foreground": "hsl(var(--color-sidebar-accent-foreground) / <alpha-value>)",
        },
        "chart-1": "var(--color-chart-1)",
        "chart-2": "var(--color-chart-2)",
        "chart-3": "var(--color-chart-3)",
        "chart-4": "var(--color-chart-4)",
        "chart-5": "var(--color-chart-5)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      screens: {
        "3xl": "1700px",
      },
    },
  },
  plugins: [],
};
