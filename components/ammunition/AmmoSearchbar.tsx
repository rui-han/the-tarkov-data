import { Box, TextField } from "@mui/material";
import { AmmoSearchbarProps } from "@/types/ammo";

export default function AmmoSearchbar({ setInputText }: AmmoSearchbarProps) {
  // handle input change
  // Technically the currentTarget property is on the parent BaseSyntheticEvent type
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  return (
    <Box mt="2vh" width="90%">
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
        onChange={handleInputChange}
        label="Search for ammunition here..."
      />
    </Box>
  );
}
