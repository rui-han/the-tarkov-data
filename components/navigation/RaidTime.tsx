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

function RaidTime() {
  // use a combination of server-side rendering (SSR) and client-side rendering (CSR) techniques to avoid the React hydration error
  // introduce an isClient state variable to track whether it is rendering on the client-side
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [futureTime, setFutureTime] = useState(new Date()); // 12 hours later

  useEffect(() => {
    setIsClient(true);
    const gameSpeed = 7; // The speed of game time passing is 7 times that of the real world
    const twelveHoursInMilliseconds = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    const timerId = setInterval(() => {
      const now = new Date();
      const moscowOffset = 3 * 3600 * 1000; // Moscow time is +3 hours ahead of UTC
      const gameMilliseconds =
        now.getTime() +
        moscowOffset +
        (now.getTime() - now.setHours(0, 0, 0, 0)) * (gameSpeed - 1);
      const gameTime = new Date(gameMilliseconds);
      const futureRaidTime = new Date(
        gameMilliseconds + twelveHoursInMilliseconds,
      );

      setCurrentTime(gameTime);
      setFutureTime(futureRaidTime);
    }, 1000 / gameSpeed);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (!isClient) {
    return <p>Loading Raid Time...</p>;
  }

  const formatTime = (date: Date) => date.toISOString().substr(11, 8);

  const isDaytime = (time: Date) => {
    const hours = time.getHours();
    return hours >= 6 && hours < 18;
  };

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
