import { ListItemIcon, MenuItem, Button } from "@mui/material";
import { Logout } from "@mui/icons-material";

export default function LogoutButton() {
  return (
    <>
      <MenuItem>
        <ListItemIcon>
          <Logout />
        </ListItemIcon>
        {/*  Next linting rules might suggest using the Link component instead of an anchor tag. 
    The Link component is meant to perform client-side transitions between pages. 
    As the link points to an API route and not to a page, you should keep it as an anchor tag. */}
        <a
          href="/api/auth/logout"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Log Out
        </a>
      </MenuItem>
    </>
  );
}
