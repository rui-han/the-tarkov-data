import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const RaidTimeContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(41, 41, 41, 0.8)",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  width: "90%",
}));

const TitleBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(0.5, 1),
  borderBottom: "1px solid rgba(154, 136, 102, 0.3)",
}));

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
    return <CircularProgress size={24} />;
  }

  const formatTime = (date: any) => date.toISOString().substr(11, 8);

  const isDaytime = (time: any) => {
    const hours = time.getHours();
    return hours >= 6 && hours < 18;
  };

  return (
    <RaidTimeContainer>
      <TitleBox>
        <AccessTimeIcon sx={{ color: "#9a8866", marginRight: 1 }} />
        <Typography
          variant="subtitle1"
          sx={{ color: "#9a8866", fontWeight: "medium" }}
        >
          Raid Time
        </Typography>
      </TitleBox>
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
    </RaidTimeContainer>
  );
}

export default RaidTime;
