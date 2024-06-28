"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// components
import LoginButton from "../users/LoginButton";
import UserMenu from "../users/UserMenu";
import ResponsiveDrawer from "./ResponsiveDrawer";

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
import EFT from "../../public/logos/EFT-logo.png";

import { useUser } from "@auth0/nextjs-auth0/client";

const drawerWidth = 240;
const appbarHeight = 64;

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // const container = window !== undefined ? () => window.document.body : undefined;
  let container;
  useEffect(() => {
    container = document.body;
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const { user } = useUser();

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
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          background: "linear-gradient(to right, #2d2d2f, #3d3d3f)",
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
          {/* logo, which redirects to home page onclick, hidden under xs screens */}
          <Box
            sx={{
              width: drawerWidth,
              display: { xs: "none", sm: "flex" },
              justifyContent: "center",
            }}
          >
            {mobileOpen ? null : (
              <Link href="/">
                <Image
                  src={EFT}
                  alt="The Tarkov Data"
                  style={{ height: "64px", width: "auto" }}
                />
              </Link>
            )}
          </Box>
          <Typography
            sx={{
              color: "#c7c5b3",
              fontWeight: 600,
              fontSize: { xs: 16, sm: 20, md: 24 },
              letterSpacing: 2,
              display: "flex",
              justifyContent: "center",
              flexGrow: 1,
            }}
          >
            THE TARKOV DATA
          </Typography>
          {/* signed in or not? */}
          <Box
            sx={{
              mr: "1vw",
              display: "flex",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {user ? <UserMenu /> : <LoginButton />}
          </Box>
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
          <ResponsiveDrawer drawerWidth={drawerWidth} />
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
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",

              boxShadow: "1px 0 3px rgba(0,0,0,0.1)",
              zIndex: (theme) => theme.zIndex.appBar - 1,
              overflow: "hidden", // prevent from showing scroll bar at the bottom
            },
            flexShrink: 0,
          }}
          open
        >
          <ResponsiveDrawer drawerWidth={drawerWidth} />
        </Drawer>
      </Box>
    </>
  );
}
