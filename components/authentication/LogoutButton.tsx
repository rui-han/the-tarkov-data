import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

export default function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <>
      <Button
        style={{ color: "inherit" }}
        onClick={() =>
          logout({ logoutParams: { returnTo: "http://localhost:3000" } })
        }
      >
        Log Out
      </Button>
    </>
  );
}
