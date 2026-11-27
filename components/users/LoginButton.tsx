import { Button } from "@mui/material";

export default function LoginButton() {
  return (
    // API route, not a page: a plain anchor (MUI renders an <a> for `href`),
    // not <Link>, and not a <button> nested inside an <a>.
    <Button
      href="/api/auth/login"
      variant="outlined"
      sx={{
        color: "inherit",
        borderColor: "inherit",
        fontSize: { xs: "12px", sm: "16px" },
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.5)",
          color: "inherit",
        },
      }}
    >
      LOGIN
    </Button>
  );
}
