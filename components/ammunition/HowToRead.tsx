import { Box, Link as MuiLink, Typography } from "@mui/material";

const columns: Array<[label: string, text: string]> = [
  [
    "Damage",
    "Damage of one projectile. Shotgun rounds show pellets × damage per pellet.",
  ],
  [
    "Penetration",
    "Penetration power. The higher it is, the better the round goes through armor.",
  ],
  [
    "Armor class ≈",
    "The highest armor class this round's penetration roughly matches (penetration ÷ 10, capped at class 6). It is a rule of thumb for comparing rounds, not a chance: the real chance also depends on the armor's durability, and damaged armor is easier to penetrate.",
  ],
  [
    "Armor Damage",
    "How much durability the round strips from armor it hits. Together with penetration and the armor's material it decides how fast armor wears down.",
  ],
  [
    "Accuracy / Recoil",
    "Modifiers applied to the weapon. Green is better, red is worse.",
  ],
  [
    "Flea price",
    "Last lowest flea market offer for one round (N/A when it isn't sold). It is a snapshot and can lag behind the game.",
  ],
];

export default function HowToRead() {
  return (
    <Box sx={{ width: "100%" }}>
      <Box component="dl" sx={{ m: 0 }}>
        {columns.map(([label, text]) => (
          <Box key={label} sx={{ mb: 1.5 }}>
            <Typography component="dt" variant="subtitle2">
              {label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Want to know how many bullets an armor stops? The community ammo chart
        rates every round against each armor class (effectiveness levels 0 to
        6). This site does not compute those levels; see{" "}
        <MuiLink
          href="https://www.eft-ammo.com/"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          the ammo chart on eft-ammo.com
        </MuiLink>{" "}
        and its{" "}
        <MuiLink
          href="https://www.eft-ammo.com/armor-and-penetration"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          armor and penetration guide
        </MuiLink>
        .
      </Typography>
    </Box>
  );
}
