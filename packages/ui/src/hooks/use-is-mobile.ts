"use client";

import { useEffect, useState } from "react";

/**
 * true quando o viewport é menor que `breakpoint` (default 768px = mobile).
 * SSR-safe: retorna false no primeiro render e sincroniza no mount via matchMedia.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}
