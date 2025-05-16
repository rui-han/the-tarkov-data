import { Paper, Box, Typography, Divider } from "@mui/material";

interface AbountProps {
  theme: any;
}

export default function About({ theme }: AbountProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        padding: 3,
        mb: 6,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
          }}
        >
          About The Tarkov Data
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography
          variant="body1"
          paragraph
          sx={{
            color: theme.palette.text.primary,
            fontSize: "1.1rem",
            lineHeight: 1.6,
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        >
          The Tarkov Data is a platform dedicated to providing Escape from
          Tarkov players with the latest and most accurate game data. Our data
          is derived from internal game files, community contributions, and
          detailed game testing.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.primary,
            fontSize: "1.1rem",
            lineHeight: 1.6,
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        >
          We work hard to keep data up to date, usually within 24 hours of a
          game update. If you find any errors or have any suggestions, please
          feel free to contact us via the feedback form above.
        </Typography>
      </Box>
    </Paper>
  );
}
