"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Grid } from "@mui/material";

export default function UserDashboard() {
  const { user, error, isLoading } = useUser();

  // if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? (
    <Grid>
      <h2>Welcome! {user?.name}</h2>
      <div>Your Items: </div>
      <div>Your Ammos: </div>
    </Grid>
  ) : (
    <h1>PLEASE LOGIN</h1>
  );
}
