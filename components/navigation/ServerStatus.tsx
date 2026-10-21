"use client";

import type { ReactNode } from "react";
import { Badge, Box, ListItemText, Tooltip, Typography } from "@mui/material";
import { useServerStatus } from "@/hooks/useServerStatus";
import StatusDot, { STATUS_COLORS } from "./StatusDot";
import type { ServerStatusInfo, ServiceStatus } from "@/types/server_status";

function ServiceRow({
  service,
  bold = false,
}: {
  service: ServiceStatus;
  bold?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
      <StatusDot level={service.level} />
      <Typography
        variant="body2"
        sx={{ flexGrow: 1, fontWeight: bold ? 700 : 400 }}
      >
        {service.name}
      </Typography>
      <Typography variant="body2" sx={{ pl: 2 }}>
        {service.label}
      </Typography>
    </Box>
  );
}

function StatusDetails({
  status,
  isLoading,
}: {
  status: ServerStatusInfo | null;
  isLoading: boolean;
}) {
  if (!status) {
    return (
      <Typography variant="body2">
        {isLoading
          ? "Loading server status…"
          : "Server status is currently unavailable."}
      </Typography>
    );
  }

  return (
    <Box sx={{ minWidth: 180, py: 0.5 }}>
      <ServiceRow service={status.overall} bold />
      {status.message && (
        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
          {status.message}
        </Typography>
      )}

      {status.services.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {status.services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </Box>
      )}

      {status.messages.map((message, i) => (
        <Typography
          key={i}
          variant="caption"
          sx={{ display: "block", mt: 1, whiteSpace: "pre-line" }}
        >
          {message}
        </Typography>
      ))}
    </Box>
  );
}

/** "EFT Server  OK" with the per-service breakdown on hover. */
export default function ServerStatus() {
  const { status, isLoading } = useServerStatus();
  const level = status?.overall.level ?? "unknown";
  const label = status ? status.overall.label : isLoading ? "…" : "Unavailable";

  return (
    <ListItemText
      primary={
        <Tooltip
          title={<StatusDetails status={status} isLoading={isLoading} />}
          arrow
          placement="right"
        >
          <Box
            component="span"
            sx={{ display: "inline-flex", alignItems: "baseline", gap: 1.5 }}
          >
            EFT Server
            <Box
              component="span"
              sx={{ color: STATUS_COLORS[level], fontSize: "0.85em" }}
            >
              {label}
            </Box>
          </Box>
        </Tooltip>
      }
    />
  );
}

/**
 * Wraps the server icon with a status dot, so the state is visible (and has
 * the same hover details) while the drawer is collapsed and the text is
 * hidden.
 */
export function ServerStatusBadge({ children }: { children: ReactNode }) {
  const { status, isLoading } = useServerStatus();
  const level = status?.overall.level ?? "unknown";

  return (
    <Tooltip
      title={<StatusDetails status={status} isLoading={isLoading} />}
      arrow
      placement="right"
    >
      <Badge
        variant="dot"
        overlap="rectangular"
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: STATUS_COLORS[level],
            // ring in the drawer's colour so the dot reads against the icon
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
          },
        }}
      >
        {children}
      </Badge>
    </Tooltip>
  );
}
