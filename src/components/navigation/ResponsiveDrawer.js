import React, { useState } from "react";
import { Link } from "react-router-dom";

// icons
import BSG from "../../images/BSG-logo.png";
import Nikita from "../../images/nikita.jpeg";
import EFT from "../../images/EFT-logo.png";

import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Toolbar,
  CssBaseline,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 240;
const appbarHeight = 64;

// hard coded, for now...
const styles = {
  link: { color: "inherit", textDecoration: "inherit", padding: 0 },
};

// the sidebar drawer
const drawer = (
  <>
    {/* logo, which redirects to home page onclick */}
    <Box display="flex" justifyContent="center">
      <Link to="/">
        <img src={EFT} alt="The Tarkov Data" style={{ height: "64px" }} />
      </Link>
    </Box>
    {/* main pages */}
    <List>
      <ListItem>
        <ListItemButton>
          <ListItemText>
            <Link to="/ammunition" style={styles.link}>
              Ammunition{" "}
            </Link>
          </ListItemText>
        </ListItemButton>
      </ListItem>
      <ListItem>
        <ListItemButton>
          <ListItemText>
            <Link to="/hideout" style={styles.link}>
              Hideout{" "}
            </Link>
          </ListItemText>
        </ListItemButton>
      </ListItem>
      <ListItem>
        <ListItemButton>
          <ListItemText>
            <Link to="/quests" style={styles.link}>
              Quests
            </Link>
          </ListItemText>
        </ListItemButton>
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
    {/* social media links */}
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
    ;
  </>
);

export default function ResponsiveDrawer({ window }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box>
      <CssBaseline />
      {/* the horizontal nav */}
      {/* 
        Grid item that is children to Grid container in App.js,
        takes up the first row
      */}
      <Grid item xs={12}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            height: `${appbarHeight}px`,
          }}
        >
          <Toolbar sx={{ padding: 0 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5">The Tarkov Data</Typography>
          </Toolbar>
        </AppBar>
      </Grid>
      {/* the responsive drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* for mobile or small screens, temporary */}
        <Drawer
          container={container}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* for larger screens, permanent */}
        {/* 
          Grid item that is also children to Grid container in App.js,
          takes up the first column
        */}
        <Grid item xs={3}>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
              flexShrink: 0,
            }}
            open
          >
            {drawer}
          </Drawer>
        </Grid>
      </Box>
    </Box>
  );
}
