/**
 * Translucent dark panel used across the home page; stays readable over the
 * blurred background image.
 */
export const panelSx = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(6px)",
} as const;
