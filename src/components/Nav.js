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

import EFT from "../images/EFT-logo.png";
import BSG from "../images/BSG-logo.png";
import Nikita from "../images/nikita.jpeg";

export default function Nav() {
  const styles = {
    appbar: {
      zIndex: (theme) => theme.zIndex.drawer + 1,
    },
    box: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    logo: { marginTop: "8px", marginRight: "20px" },
    link: {
      color: "inherit",
      textDecoration: "inherit",
    },
  };

  return (
    <Box sx={styles.box}>
      <AppBar sx={styles.appbar}>
        <Toolbar sx={{ padding: 0 }}>
          <Box sx={styles.logo}>
            <Link to="/">
              <img src={EFT} alt="The Tarkov Data" style={{ height: "5vh" }} />
            </Link>
          </Box>
          <Typography variant="h5">The Tarkov Data</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" anchor="left">
        <Toolbar />
        <Divider />
        {/* Main pages */}
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
        {/* Github link */}
        <List>
          <ListItem>
            <ListItemButton
              onClick={() =>
                window.open("https://github.com/rui-han/the-tarkov-data")
              }
            >
              <ListItemText>Github Page</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        {/* Social media links */}
        <List>
          <ListItem>
            <ListItemButton
              onClick={() => window.open("https://twitter.com/nikgeneburn")}
            >
              <img
                src={Nikita}
                style={{ height: "30px", marginRight: "10px" }}
                alt="Nikita Buyanov"
              />
              <ListItemText>Nikita</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => window.open("https://twitter.com/bstategames")}
            >
              <img
                src={BSG}
                style={{ height: "30px", marginRight: "10px" }}
                alt="Battle State Games"
              />
              <ListItemText>BSG</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}
