import { describe, expect, it } from "vitest";
import { CHART_COLORS, chartColor, formatters } from "./chart-theme";

describe("chartColor", () => {
  it("returns the color at the given index", () => {
    expect(chartColor(0)).toBe(CHART_COLORS[0]);
    expect(chartColor(2)).toBe(CHART_COLORS[2]);
  });

  it("wraps around the palette using modulo", () => {
    expect(chartColor(CHART_COLORS.length)).toBe(CHART_COLORS[0]);
    expect(chartColor(CHART_COLORS.length + 1)).toBe(CHART_COLORS[1]);
  });
});

describe("formatters (pt-BR)", () => {
  it("formats integers with pt-BR thousands separator", () => {
    expect(formatters.number(1234567)).toBe("1.234.567");
    expect(formatters.number(0)).toBe("0");
  });

  it("formats currency as BRL", () => {
    // pt-BR currency uses non-breaking space (U+00A0) between symbol and value
    expect(formatters.currency(1234.5)).toBe("R$ 1.234,50");
    expect(formatters.currency(0)).toBe("R$ 0,00");
  });

  it("formats a ratio as a percentage with one decimal", () => {
    expect(formatters.percent(0.123)).toBe("12.3%");
    expect(formatters.percent(1)).toBe("100.0%");
    expect(formatters.percent(0)).toBe("0.0%");
  });

  it("formats large numbers in compact pt-BR notation", () => {
    expect(formatters.compact(1500)).toBe("1,5 mil");
    expect(formatters.compact(2_000_000)).toBe("2 mi");
  });
});
