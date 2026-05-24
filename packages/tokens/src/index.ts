export const tokens = {
  colors: {
    honey: "oklch(0.78 0.16 75)",
    honeySoft: "oklch(0.93 0.08 85)",
    honeyDeep: "oklch(0.56 0.13 65)",
    ink: "oklch(0.16 0 0)",
    paper: "oklch(0.98 0.003 95)",
    paper2: "oklch(0.96 0.005 95)",
    ok: "oklch(0.5 0.13 145)",
    warn: "oklch(0.56 0.13 65)",
    err: "oklch(0.52 0.18 25)",
    info: "oklch(0.58 0.13 240)",
  },
  radius: {
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
  },
  breakpoints: {
    "3xl": "1700px",
  },
} as const;

export type Tokens = typeof tokens;
