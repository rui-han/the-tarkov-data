import { Divider, Link as MuiLink, Paper, Typography } from "@mui/material";
import { panelSx } from "./styles";

export default function About() {
  return (
    <Paper elevation={0} sx={{ ...panelSx, p: 3, mb: 2 }}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        About The Tarkov Data
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
        The Tarkov Data is an unofficial, community-made lookup tool for Escape
        from Tarkov players. All game data comes from the open{" "}
        <MuiLink
          href="https://tarkov.dev"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          tarkov.dev
        </MuiLink>{" "}
        project, so it is as fresh as their published files. Flea market prices
        are snapshots and can lag behind the game.
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
        Found an error or have a suggestion? Please use the feedback form above,
        or open an issue on{" "}
        <MuiLink
          href="https://github.com/rui-han/the-tarkov-data"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          GitHub
        </MuiLink>
        .
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Escape from Tarkov is a trademark of Battlestate Games. This project is
        not affiliated with them.
      </Typography>
    </Paper>
  );
}
