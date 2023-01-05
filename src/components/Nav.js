import React from "react";
import { Link } from "react-router-dom";

import {
  AppBar,
  Box,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Drawer,
  CssBaseline,
  Typography,
} from "@mui/material";

export default function Nav() {
  const linkStyle = {
    color: "inherit",
    textDecoration: "inherit",
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6">The Tarkov Data</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" anchor="left">
        <Toolbar />
        <Divider />
        <List>
          <ListItem>
            <Link to="/" style={linkStyle}>
              <ListItemButton>
                <ListItemText>Ammunition</ListItemText>
              </ListItemButton>
            </Link>
          </ListItem>
          <ListItem>
            <Link to="/hideout" style={linkStyle}>
              <ListItemButton>
                <ListItemText>Hideout</ListItemText>
              </ListItemButton>
            </Link>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem>
            <ListItemButton>
              <ListItemText>FAQ</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}
