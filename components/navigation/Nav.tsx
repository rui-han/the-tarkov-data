"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// components
import drawer from "./ResponsiveDrawer";
import LoginButton from "../users/LoginButton";
import UserMenu from "../users/UserMenu";

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
import { useAuth0 } from "@auth0/auth0-react";

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

  const { isAuthenticated } = useAuth0();

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
            <Link href="/">
              <Image
                src={EFT}
                alt="The Tarkov Data"
                style={{ height: "64px", width: "auto" }}
              />
            </Link>
          </Box>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: 30,
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
            {isAuthenticated ? <UserMenu /> : <LoginButton />}
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
