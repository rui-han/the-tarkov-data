"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameMode } from "@/contexts/GameModeContext";
import { GAME_MODE_LABELS } from "@/lib/tarkovApi";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function Hero() {
  const router = useRouter();
  const { gameMode, isReady } = useGameMode();
  const [query, setQuery] = useState("");

  // the items page reads ?q= as its initial search term
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/items?q=${encodeURIComponent(q)}` : "/items");
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        color: "text.primary",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
        py: { xs: 4, md: 8 },
        mb: 4,
      }}
    >
      <Typography
        component="h1"
        gutterBottom
        sx={{
          fontSize: { xs: "2.25rem", md: "3.5rem" },
          fontWeight: 600,
          lineHeight: 1.15,
        }}
      >
        The Ultimate EFT Data Hub
      </Typography>
      <Typography
        sx={{ fontSize: { xs: "1rem", md: "1.5rem" }, opacity: 0.9, mb: 4 }}
      >
        Get all Tarkov game stats and information in one place
      </Typography>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: "0 auto" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, e.g. m855, salewa, ledx"
            inputProps={{ "aria-label": "Search items" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { backgroundColor: "rgba(0, 0, 0, 0.55)" },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ px: 3, flexShrink: 0 }}
          >
            Search
          </Button>
        </Box>
      </form>

      <Box sx={{ mt: 2, minHeight: 56 }}>
        {/* nothing until the saved mode has been read, so it doesn't flash PvP */}
        {isReady && (
          <Chip
            label={`Showing ${GAME_MODE_LABELS[gameMode].full} data`}
            size="small"
            variant="outlined"
            sx={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          />
        )}
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 0.5, opacity: 0.8 }}
        >
          Switch between PvP, PvE and Season in the top bar
        </Typography>
      </Box>
    </Box>
  );
}
