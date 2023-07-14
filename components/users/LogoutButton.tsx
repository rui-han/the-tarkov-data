import { useAuth0 } from "@auth0/auth0-react";
import { ListItemIcon, MenuItem } from "@mui/material";
import { Logout } from "@mui/icons-material";

export default function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <MenuItem
      onClick={() =>
        logout({
          logoutParams: { returnTo: "https://the-tarkov-data.vercel.app/" },
        })
      }
    >
      <ListItemIcon>
        <Logout />
      </ListItemIcon>
      Log Out
    </MenuItem>
  );
}
