import Link from "next/link";
import { Button } from "@mui/material";

export default function LoginButton() {
  return (
    <>
      <Link href="/api/auth/login" style={{ color: "inherit" }}>
        <Button sx={{ color: "inherit" }}>Log In / Sign Up</Button>
      </Link>
    </>
  );
}
