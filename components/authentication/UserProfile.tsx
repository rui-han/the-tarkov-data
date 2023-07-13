import { useAuth0 } from "@auth0/auth0-react";
import { Box } from "@mui/material";

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>loading...</div>;

  return (
    isAuthenticated && (
      <Box mr="1vw">
        <img style={{ height: "32px" }} src={user?.picture} alt={user?.name} />
      </Box>
    )
  );
}
