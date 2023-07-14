import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { Settings, Dashboard } from "@mui/icons-material";

import LogoutButton from "./LogoutButton";

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return <div>loading...</div>;

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorElement);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorElement(null);
  };

  return (
    isAuthenticated && (
      <>
        <IconButton
          onClick={handleClick}
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            src={user?.picture}
            alt={user?.name}
            sx={{ bgcolor: deepOrange[200] }}
          />
        </IconButton>
        {/* user menu, which is a temporary surface */}
        <Menu
          anchorEl={anchorElement}
          id="user-menu"
          open={open}
          onClick={handleClose}
          onClose={handleClose}
        >
          {/* TODO dashboard */}
          <MenuItem>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            Dashboard
          </MenuItem>
          {/* TODO settings  */}
          <MenuItem>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            Settings
          </MenuItem>
          <LogoutButton />
        </Menu>
      </>
    )
  );
}
