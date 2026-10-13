import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
// icons
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";

const TimeBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
}));

const TimeTypography = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontFamily: "'Roboto Mono', monospace",
  color: "#9a8866",
}));

const GAME_SPEED = 7; // game time runs 7x faster than real time
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MOSCOW_OFFSET_MS = 3 * HOUR_MS; // Moscow is UTC+3

/**
 * Tarkov clock for a given real timestamp. It only depends on the epoch, so it
 * is independent of the browser's time zone. The returned Date should be read
 * with UTC getters / toISOString.
 */
const toTarkovTime = (realMs: number, shiftMs = 0): Date =>
  new Date((realMs * GAME_SPEED + MOSCOW_OFFSET_MS + shiftMs) % DAY_MS);

const formatTime = (date: Date): string => date.toISOString().slice(11, 19);

const isDaytime = (date: Date): boolean => {
  const hours = date.getUTCHours();
  return hours >= 6 && hours < 18;
};

function RaidTime() {
  // `now` stays null until mounted on the client, so the server render and the
  // first client render match (avoids a React hydration error).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timerId = setInterval(() => setNow(Date.now()), 1000 / GAME_SPEED);
    return () => clearInterval(timerId);
  }, []);

  if (now === null) {
    return <p>Loading Raid Time...</p>;
  }

  const currentTime = toTarkovTime(now);
  const futureTime = toTarkovTime(now, 12 * HOUR_MS); // 12 hours later

  return (
    <>
      <TimeBox>
        {isDaytime(currentTime) ? (
          <WbSunnyIcon sx={{ color: "#ffd700" }} />
        ) : (
          <NightsStayIcon sx={{ color: "#4169e1" }} />
        )}
        <TimeTypography variant="body2">
          {formatTime(currentTime)}
        </TimeTypography>
      </TimeBox>
      <TimeBox>
        {isDaytime(futureTime) ? (
          <WbSunnyIcon sx={{ color: "#ffd700" }} />
        ) : (
          <NightsStayIcon sx={{ color: "#4169e1" }} />
        )}
        <TimeTypography variant="body2">
          {formatTime(futureTime)}
        </TimeTypography>
      </TimeBox>
    </>
  );
}

export default RaidTime;
