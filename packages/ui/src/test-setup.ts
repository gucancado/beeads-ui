import "@testing-library/jest-dom/vitest";

// happy-dom doesn't implement the Web Animations API. base-ui's ScrollArea
// viewport (used inside SidebarBody) calls `Element.prototype.getAnimations()`
// from a background timer, which throws once a mounted viewport is exercised
// across an `await` (e.g. off-canvas Sidebar tests). Shim it as a no-op.
if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}
