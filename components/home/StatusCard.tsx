"use client";

import { Fragment } from "react";
import {
  Box,
  Link as MuiLink,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { useServerStatus } from "@/hooks/useServerStatus";
import StatusDot, { STATUS_COLORS } from "@/components/navigation/StatusDot";
import { panelSx } from "./styles";

/** Overall EFT server status plus every service; refreshed every minute. */
export default function StatusCard() {
  const { status, isLoading } = useServerStatus();
  const level = status?.overall.level ?? "unknown";

  return (
    <Paper elevation={0} sx={{ ...panelSx, p: 3, height: "100%" }}>
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Server status
      </Typography>

      {!status ? (
        isLoading ? (
          <>
            <Skeleton width="40%" height={36} />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Server status is currently unavailable.
          </Typography>
        )
      ) : (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <StatusDot level={level} size={14} />
            <Typography
              variant="h5"
              sx={{ color: STATUS_COLORS[level], fontWeight: 600 }}
            >
              {status.overall.label}
            </Typography>
          </Box>

          {status.message && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              {status.message}
            </Typography>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              rowGap: 0.75,
              columnGap: 2,
            }}
          >
            {status.services.map((service) => (
              <Fragment key={service.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StatusDot level={service.level} size={8} />
                  <Typography variant="body2">{service.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {service.label}
                </Typography>
              </Fragment>
            ))}
          </Box>

          {status.messages.map((message, i) => (
            <Typography
              key={i}
              variant="caption"
              sx={{ display: "block", mt: 1.5, whiteSpace: "pre-line" }}
            >
              {message}
            </Typography>
          ))}
        </>
      )}

      <MuiLink
        href="https://status.escapefromtarkov.com/"
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        variant="caption"
        sx={{ display: "inline-block", mt: 2 }}
      >
        Official status page ↗
      </MuiLink>
    </Paper>
  );
}
