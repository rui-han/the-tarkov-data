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

export default function UserProfile() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>loading...</div>;
  if (error) return <div>{error.message}</div>;

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
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
          {/* TODO dashboard */}
          <Link
            href="/dashboard"
            style={{
              color: "inherit",
              textDecoration: "inherit",
              padding: 0,
            }}
          >
            <MenuItem>
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              Dashboard
            </MenuItem>
          </Link>
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
