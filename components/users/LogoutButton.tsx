import { ListItemIcon, MenuItem } from "@mui/material";
import { Logout } from "@mui/icons-material";

export default function LogoutButton() {
  return (
    // This goes to an API route, not to a page, so it must stay a plain anchor
    // (not <Link>, which is for client-side page transitions). MUI renders an
    // <a> for `component="a"`, and the whole row is the click target.
    <MenuItem component="a" href="/api/auth/logout">
      <ListItemIcon>
        <Logout />
      </ListItemIcon>
      Log Out
    </MenuItem>
  );
}
