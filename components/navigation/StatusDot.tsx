import { Box } from "@mui/material";
import type { StatusLevel } from "@/types/server_status";

export const STATUS_COLORS: Record<StatusLevel, string> = {
  ok: "#a2ff86",
  updating: "#ffd54f",
  issues: "#ff9800",
  down: "#ff5252",
  unknown: "#9e9e9e",
};

export default function StatusDot({
  level,
  size = 10,
}: {
  level: StatusLevel;
  size?: number;
}) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        display: "inline-block",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: STATUS_COLORS[level],
      }}
    />
  );
}
