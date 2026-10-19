"use client";

import React, { useMemo } from "react";
import { Box, Chip, Typography } from "@mui/material";
import FallbackImage from "@/components/hideout/FallbackImage";
import { useItemMap } from "@/hooks/useHideoutData";
import { ROUBLES_ID, formatPrice } from "@/lib/hideout";
import { formatStanding, objectiveText } from "@/lib/tasks";
import type { Trader } from "@/types/hideout";
import type { GameMap, Task } from "@/types/task";

/** Objectives accepting more items than this just show a count. */
const MAX_LISTED_ITEMS = 4;

interface ItemEntry {
  itemId: string;
  count?: number;
}

const pillSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  px: 1,
  py: 0.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
} as const;

/**
 * Item names come from the (large) items files. This only mounts when a task
 * with items is expanded, so the download starts on demand; the data is
 * shared with the other pages through the SWR cache.
 * `entries` must be referentially stable.
 */
function ItemList({ entries }: { entries: ItemEntry[] }) {
  const ids = useMemo(() => new Set(entries.map((e) => e.itemId)), [entries]);
  const { itemsById, isLoading } = useItemMap(ids);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
      {entries.map((entry, i) => {
        const item = itemsById.get(entry.itemId);
        const isRoubles = entry.itemId === ROUBLES_ID;
        const name = isLoading ? "…" : item?.name ?? "Unknown item";
        const label =
          isRoubles && entry.count != null
            ? formatPrice(entry.count)
            : entry.count != null
            ? `${name} ×${entry.count}`
            : name;

        return (
          <Box key={`${entry.itemId}-${i}`} sx={pillSx}>
            <FallbackImage
              key={item?.iconLink ?? "none"}
              sources={[item?.iconLink]}
              alt=""
              size={28}
            />
            <Typography variant="body2">{label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function ObjectiveItems({ itemIds }: { itemIds: string[] }) {
  const entries = useMemo(
    () => itemIds.map((itemId) => ({ itemId })),
    [itemIds],
  );
  return <ItemList entries={entries} />;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: "block", lineHeight: 1.8 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

interface TaskDetailsProps {
  task: Task;
  tasksById: ReadonlyMap<string, Task>;
  tradersById: ReadonlyMap<string, Trader>;
  mapsById: ReadonlyMap<string, GameMap>;
}

export default function TaskDetails({
  task,
  tasksById,
  tradersById,
  mapsById,
}: TaskDetailsProps) {
  const { rewards } = task;
  const traderName = (id: string) =>
    tradersById.get(id)?.name ?? "Unknown trader";
  const hasPrerequisites =
    task.taskRequirements.length > 0 || task.traderRequirements.length > 0;
  const hasRewards =
    task.experience > 0 ||
    rewards.traderStanding.length > 0 ||
    rewards.items.length > 0 ||
    rewards.unlocks.length > 0;

  return (
    <Box
      sx={{
        p: 2,
        display: "grid",
        gap: 3,
        gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
        bgcolor: "action.hover",
      }}
    >
      {/* objectives */}
      <Box>
        <Section title="Objectives">
          {task.objectives.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No objectives listed.
            </Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {task.objectives.map((objective) => (
                <Box component="li" key={objective.id} sx={{ mb: 1 }}>
                  <Typography variant="body2" component="span">
                    {objectiveText(objective)}
                  </Typography>
                  {objective.optional && (
                    <Chip
                      label="Optional"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                  {objective.foundInRaid && (
                    <Chip
                      label="FIR"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                  {objective.mapIds.map((id) => (
                    <Chip
                      key={id}
                      label={mapsById.get(id)?.name ?? "Unknown map"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  ))}

                  {objective.itemIds.length > 0 &&
                    (objective.itemIds.length <= MAX_LISTED_ITEMS ? (
                      <ObjectiveItems itemIds={objective.itemIds} />
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        Any of {objective.itemIds.length} items
                      </Typography>
                    ))}
                </Box>
              ))}
            </Box>
          )}
        </Section>
      </Box>

      {/* requirements & rewards */}
      <Box>
        {hasPrerequisites && (
          <Section title="Requirements">
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {task.taskRequirements.map((req) => {
                // "complete" is the default, only mention other statuses
                const status = req.status.filter((s) => s !== "complete");
                return (
                  <Typography component="li" variant="body2" key={req.taskId}>
                    {tasksById.get(req.taskId)?.name ?? "Unknown task"}
                    {status.length > 0 ? ` (${status.join(" / ")})` : ""}
                  </Typography>
                );
              })}
              {task.traderRequirements.map((req) => (
                <Typography component="li" variant="body2" key={req.traderId}>
                  {traderName(req.traderId)} LL{req.level}
                </Typography>
              ))}
            </Box>
          </Section>
        )}

        <Section title="Rewards">
          {!hasRewards ? (
            <Typography variant="body2" color="text.secondary">
              No rewards listed.
            </Typography>
          ) : (
            <>
              {task.experience > 0 && (
                <Typography variant="body2">
                  {task.experience.toLocaleString("en-US")} XP
                </Typography>
              )}
              {rewards.traderStanding.map((s) => (
                <Typography variant="body2" key={s.traderId}>
                  {traderName(s.traderId)} standing {formatStanding(s.standing)}
                </Typography>
              ))}
              {rewards.items.length > 0 && <ItemList entries={rewards.items} />}
              {rewards.unlocks.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Also unlocks: {rewards.unlocks.join(", ")}
                </Typography>
              )}
            </>
          )}
        </Section>
      </Box>
    </Box>
  );
}
