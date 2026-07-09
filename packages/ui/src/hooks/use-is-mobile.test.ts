import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-is-mobile";

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initialMatches: boolean) {
  let listener: Listener | null = null;
  const mql = {
    matches: initialMatches,
    media: "",
    addEventListener: (_: string, cb: Listener) => {
      listener = cb;
    },
    removeEventListener: () => {
      listener = null;
    },
  };
  const spy = vi.fn().mockReturnValue(mql);
  vi.stubGlobal("matchMedia", spy);
  return {
    spy,
    setMatches(matches: boolean) {
      mql.matches = matches;
      act(() => listener?.({ matches }));
    },
  };
}

describe("useIsMobile", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna true quando o viewport casa com a media query", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("retorna false em viewport largo e reage a mudança", () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    media.setMatches(true);
    expect(result.current).toBe(true);
  });

  it("usa o breakpoint custom na media query", () => {
    const media = mockMatchMedia(false);
    renderHook(() => useIsMobile(1024));
    expect(media.spy).toHaveBeenCalledWith("(max-width: 1023px)");
  });
});
