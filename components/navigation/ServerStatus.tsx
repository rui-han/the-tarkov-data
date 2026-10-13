"use client";

import { useTarkovData } from "@/hooks/useTarkovData";
import { ServerStatusData } from "@/types/server_status";
import { ListItemText } from "@mui/material";

export default function ServerStatus() {
  const { data, error, isLoading } = useTarkovData<ServerStatusData>("status");

  if (error) {
    return (
      <ListItemText>
        Server Status
        <span style={{ color: "red", marginLeft: "8px" }}>Error</span>
      </ListItemText>
    );
  }

  const dotColor =
    !isLoading && Number(data?.status?.generalStatus?.status ?? -1) === 0
      ? "#a2ff86"
      : "red";

  return (
    <ListItemText>
      EFT Server
      <span
        style={{
          backgroundColor: dotColor,
          borderRadius: "50%",
          width: "12px",
          height: "12px",
          display: "inline-block",
          marginLeft: "16px",
        }}
      />
    </ListItemText>
  );
}
