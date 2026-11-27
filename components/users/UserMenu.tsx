import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

import Link from "next/link";

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

export default function UserMenu() {
  const { user, error, isLoading } = useUser();
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

  if (isLoading) return <div>loading...</div>;
  if (error) return <div>{error.message}</div>;

  const open = Boolean(anchorElement);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorElement(null);
  };

  return (
    user && (
      <>
        <IconButton
          onClick={handleClick}
          aria-label="Open user menu"
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            src={String(user?.picture)}
            alt={String(user?.name)}
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
          <MenuItem component={Link} href="/dashboard">
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
