/** The parts of a click that decide whether the browser should handle it. */
export interface ClickLike {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/**
 * A plain left click: the one a client-side navigation should react to.
 * Ctrl/Cmd/Shift/Alt clicks and middle clicks open a new tab or window, which
 * is the browser's job, so the app must not treat them as "navigating here".
 */
export function isPlainLeftClick(event: ClickLike): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
