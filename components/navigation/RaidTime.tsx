import { useState, useEffect } from "react";

function RaidTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [futureTime, setFutureTime] = useState(new Date()); // 12 hours later

  useEffect(() => {
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

  // Format the current game time as HH:MM:SS
  const formatCurrentTime = currentTime.toISOString().substr(11, 8);
  // Format the game time 12 hours later as HH:MM:SS
  const formatFutureTime = futureTime.toISOString().substr(11, 8);

  return (
    <>
      <div>{formatCurrentTime}</div>
      <div>{formatFutureTime}</div>
    </>
  );
}

export default RaidTime;
