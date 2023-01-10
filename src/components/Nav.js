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
  Typography,
} from "@mui/material";

export default function Nav() {
  const styles = {
    box: {
      display: "flex",
    },
    appbar: {
      zIndex: (theme) => theme.zIndex.drawer + 1,
    },
    link: {
      color: "inherit",
      textDecoration: "inherit",
    },
  };

  return (
    <Box sx={styles.box}>
      <AppBar position="fixed" sx={styles.appbar}>
        <Toolbar>
          <Typography variant="h5">The Tarkov Data</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" anchor="left">
        <Toolbar />
        <Divider />
        <List>
          <ListItem>
            <Link to="/ammunition" style={styles.link}>
              <ListItemButton>
                <ListItemText>Ammunition</ListItemText>
              </ListItemButton>
            </Link>
          </ListItem>
          <ListItem>
            <Link to="/hideout" style={styles.link}>
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
              <ListItemText>Github Page</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}
