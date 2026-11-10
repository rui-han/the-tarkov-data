import { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { AmmoSearchbarProps } from "@/types/ammo";

export default function AmmoSearchbar({
  setInputText,
  value,
}: AmmoSearchbarProps) {
  const [ownText, setOwnText] = useState("");
  // controlled when the parent passes `value`, otherwise it keeps its own text
  const text = value ?? ownText;

  const update = (next: string) => {
    setOwnText(next);
    setInputText(next);
  };

  return (
    <TextField
      fullWidth
      sx={{
        "& label.Mui-focused": {
          color: "#A0AAB4",
        },
        "& .MuiInput-underline:after": {
          borderBottomColor: "#B2BAC2",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "inherit",
          },
          "&:hover fieldset": {
            borderColor: "#B2BAC2",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#6F7E8C",
          },
        },
      }}
      value={text}
      onChange={(e) => update(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") update("");
      }}
      label="Search for ammunition here..."
      placeholder="e.g. m855a1, 7.62x39, buckshot"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: text ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              aria-label="Clear search"
              onClick={() => update("")}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
}
