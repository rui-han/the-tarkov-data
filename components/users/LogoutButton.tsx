import { ListItemIcon, MenuItem, Button } from "@mui/material";
import { Logout } from "@mui/icons-material";
import Link from "next/link";

export default function LogoutButton() {
  return (
    <MenuItem>
      <ListItemIcon>
        <Logout />
      </ListItemIcon>
      <Link
        href="/api/auth/logout"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        Log Out
      </Link>
    </MenuItem>
  );
}
