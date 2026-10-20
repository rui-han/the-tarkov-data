"use client";

import { useState } from "react";
import { useGameMode } from "@/contexts/GameModeContext";
import { GAME_MODES, GAME_MODE_LABELS, type GameMode } from "@/lib/tarkovApi";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

/**
 * Global game mode switch for the app bar. Picking another mode only opens a
 * confirmation; the mode changes when the user confirms.
 */
export default function GameModeSwitch() {
  const { gameMode, setGameMode, isReady } = useGameMode();
  const [open, setOpen] = useState(false);
  // kept separately from `open` so the dialog text doesn't change while it
  // fades out
  const [target, setTarget] = useState<GameMode>(gameMode);

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: GameMode | null,
  ) => {
    // value is null when the already selected button is clicked
    if (!value || value === gameMode) return;
    setTarget(value);
    setOpen(true);
  };

  const handleConfirm = () => {
    setGameMode(target);
    setOpen(false);
  };

  const targetLabel = GAME_MODE_LABELS[target].full;

  return (
    <>
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        // nothing is highlighted until the saved mode has been read
        value={isReady ? gameMode : null}
        disabled={!isReady}
        onChange={handleChange}
        aria-label="Game mode"
        sx={{
          "& .MuiToggleButton-root": {
            px: { xs: 1, sm: 2 },
            py: 0.5,
            fontSize: { xs: 12, sm: 14 },
          },
        }}
      >
        {GAME_MODES.map((mode) => (
          <ToggleButton key={mode} value={mode}>
            {GAME_MODE_LABELS[mode].short}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="game-mode-dialog-title"
      >
        <DialogTitle id="game-mode-dialog-title">
          Switch to {targetLabel}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Items, tasks, hideout requirements and prices will be reloaded with
            the {targetLabel} data, which can take a few seconds the first time.
            Your choice is remembered in this browser.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} autoFocus>
            Switch
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
