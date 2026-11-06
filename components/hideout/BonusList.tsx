import { Box, Typography } from "@mui/material";
import { formatBonusValue, skillLabel } from "@/lib/hideout";
import type { HideoutBonus, Skill } from "@/types/hideout";
import FallbackImage from "./FallbackImage";

interface BonusListProps {
  bonuses: HideoutBonus[];
  skillsById: ReadonlyMap<string, Skill>;
}

const chipSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  px: 1.5,
  py: 0.75,
  maxWidth: 360,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  textAlign: "left",
} as const;

/** What a station level grants once it is built. */
export default function BonusList({ bonuses, skillsById }: BonusListProps) {
  if (bonuses.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: "block", lineHeight: 1.8 }}
      >
        Bonuses
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 1.5,
        }}
      >
        {bonuses.map((bonus) => {
          const skill = bonus.skillId
            ? skillsById.get(bonus.skillId)
            : undefined;
          const value = formatBonusValue(bonus.type, bonus.value);

          return (
            <Box key={bonus.id} sx={chipSx}>
              {skill?.imageLink && (
                <FallbackImage sources={[skill.imageLink]} alt="" size={28} />
              )}
              <Box>
                <Typography variant="body2">
                  {bonus.label}
                  {value && (
                    <>
                      {" "}
                      <strong>{value}</strong>
                    </>
                  )}
                </Typography>
                {bonus.skillId && (
                  <Typography variant="caption" color="text.secondary">
                    {skillLabel(skillsById, bonus.skillId)}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
