import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
// components
import ResponsiveDrawer from "./ResponsiveDrawer";
import LoginButton from "../users/LoginButton";
import UserMenu from "../users/UserMenu";
import RaidTime from "./RaidTime";
// MUI
import {
  Typography,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
} from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
// icons
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// drawer width and appbar height
const drawerWidth = 240;
const appbarHeight = 64;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  backgroundColor: "#2d2d2f",
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  boxShadow: "1px 0 3px rgba(0,0,0,0.1)",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  backgroundColor: "#2d2d2f",
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  boxShadow: "1px 0 3px rgba(0,0,0,0.1)",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

// DrawerHeader
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// AppBar
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open", // to prevent the open prop from being passed to MUI's AppBar
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  background: "linear-gradient(to right, #2d2d2f, #3d3d3f)",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // when open is true, use the following styling
  ...(open && {
    marginLeft: drawerWidth,
    height: appbarHeight,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Drawer
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export default function Nav() {
  const user = useUser();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleMiniDrawerOpen = () => {
    setOpen(true);
  };

  const handleMiniDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleMiniDrawerOpen}
            edge="start"
            sx={{
              mr: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* title */}
          <Typography
            sx={{
              color: "#c7c5b3",
              fontWeight: 600,
              fontSize: { xs: 16, sm: 20, md: 24 },
              letterSpacing: 2,
              display: "flex",
              justifyContent: "center",
              flexGrow: 0,
            }}
          >
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              THE TARKOV DATA
            </Link>
          </Typography>

          {/* user menu, if not signed in, display login button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "right",
              flexGrow: 1,
            }}
          >
            {user.user === undefined ? <LoginButton /> : <UserMenu />}
          </Box>
        </Toolbar>
      </AppBar>

      {/* For larger screen devices, add a permanent mini variant drawer */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton sx={{ mb: "2vh" }} onClick={handleMiniDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <ResponsiveDrawer drawerWidth={drawerWidth} />
      </Drawer>
      {/* For small screen devices, add a temporary drawer */}
      <MuiDrawer
        variant="temporary"
        open={open}
        onClose={handleMiniDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        <ResponsiveDrawer drawerWidth={drawerWidth} />
      </MuiDrawer>
    </Box>
  );
}
