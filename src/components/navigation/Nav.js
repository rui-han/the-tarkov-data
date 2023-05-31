import React, { useState } from "react";
import { Link } from "react-router-dom";
import drawer from "./ResponsiveDrawer";
import EFT from "../../images/EFT-logo.png";

// MUI
import {
  AppBar,
  Box,
  Drawer,
  Toolbar,
  CssBaseline,
  Typography,
  IconButton,
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
    <>
      <CssBaseline />
      {/* the horizontal nav */}
      <AppBar
        position="fixed"
        color="secondary"
        sx={{
          width: "100%",
          height: appbarHeight,
        }}
      >
        <Toolbar disableGutters={true}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ ml: 1, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          {/* logo, which redirects to home page onclick */}
          <Box
            sx={{
              width: drawerWidth,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Link to="/">
              <img src={EFT} alt="The Tarkov Data" style={{ height: "64px" }} />
            </Link>
          </Box>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: 30,
              display: "flex",
              justifyContent: "center",
            }}
          >
            The Tarkov Data
          </Typography>
        </Toolbar>
      </AppBar>
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
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              pt: "64px",
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#2d2d2f",
              zIndex: (theme) => theme.zIndex.appBar - 1,
            },
            flexShrink: 0,
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}
