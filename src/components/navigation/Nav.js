import React, { useState } from "react";
import drawer from "./ResponsiveDrawer";

// MUI
import {
  AppBar,
  Box,
  Drawer,
  Toolbar,
  CssBaseline,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 240;
const appbarHeight = 64;

export default function Nav({ window }) {
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
              sx={{ ml: 2, mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "30px",
              }}
            >
              The Tarkov Data
            </Typography>
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
          onClick={handleDrawerToggle}
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
