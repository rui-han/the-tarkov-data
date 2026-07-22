import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Explicitly clean up the DOM after each test. React Testing Library can
// auto-register this via a global `afterEach`, but we don't enable
// `test.globals` in vitest.config.ts, so we register it ourselves to make
// sure it always runs regardless of that setting.
afterEach(() => {
  cleanup();
});
