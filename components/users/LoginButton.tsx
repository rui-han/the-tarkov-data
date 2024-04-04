import Link from "next/link";
import { Button } from "@mui/material";

export default function LoginButton() {
  return (
    <>
      <Link href="/api/auth/login" style={{ color: "inherit" }}>
        <Button
          variant="outlined"
          sx={{
            color: "inherit",
            borderColor: "inherit",
            fontSize: { xs: "12px", sm: "16px" },
          }}
        >
          LOGIN
        </Button>
      </Link>
    </>
  );
}
