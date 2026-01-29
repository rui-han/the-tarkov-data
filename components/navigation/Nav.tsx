"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

// components
import ResponsiveDrawer from "./ResponsiveDrawer";
import LoginButton from "../users/LoginButton";
import UserMenu from "../users/UserMenu";
import ExternalLinkConfirmDialog from "./ExternalLinkConfirmDialog";

// MUI
import {
  useMediaQuery,
  Typography,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Divider,
  CircularProgress,
  Drawer as MuiDrawer,
} from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";

// icons
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * Layout constants
 */
const drawerWidth = 240;
const appbarHeight = 64;

/**
 * Interfaces
 */
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

/**
 * Mixins for Drawer animations
 * Note: Colors are now removed from here and handled by theme.palette.background.paper
 */
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  overflowX: "hidden",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const closedMixin = (theme: Theme): CSSObject => ({
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

/**
 * Styled AppBar
 * Note: Background color/gradient is now handled in theme.ts (MuiAppBar override)
 */
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  height: appbarHeight,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

/**
 * Desktop Drawer (Mini-variant)
 */
const DesktopDrawer = styled(MuiDrawer, {
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
}));

/**
 * Header area inside the drawer (for the collapse button)
 */
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

/**
 * Main Navigation component
 */
export default function Nav() {
  const { user, isLoading } = useUser();
  const theme = useTheme();

  // Use a 'mounted' state to prevent Hydration Mismatch errors
  // This ensures responsive logic only runs on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // UI States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [externalLink, setExternalLink] = useState<{
    url: string;
    label: string;
  } | null>(null);

  // Handlers
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* ---------- AppBar ---------- */}
      {/* Logic: If on Desktop and drawer is open, AppBar shifts (handled by styled component) */}
      <AppBar position="fixed" open={!isMobile && drawerOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open navigation drawer"
            edge="start"
            onClick={openDrawer}
            sx={{
              mr: 2,
              // Hide menu button if drawer is open AND we are on desktop
              // On mobile, the drawer covers the menu, so button visibility matters less
              display: !isMobile && drawerOpen ? "none" : "flex",
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* App Title */}
          <Typography
            component="div" // Important: Avoids nesting <a> inside <p>
            sx={{
              // Colors are now inherited from theme.palette.text.primary
              fontWeight: 600,
              fontSize: { xs: 16, sm: 20 },
              letterSpacing: 2,
              display: { xs: "none", sm: "block" },
            }}
          >
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              THE TARKOV DATA
            </Link>
          </Typography>

          {/* Right side user actions */}
          <Box sx={{ ml: "auto" }}>
            {isLoading ? (
              <CircularProgress color="inherit" size={24} />
            ) : user ? (
              <UserMenu />
            ) : (
              <LoginButton />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ---------- Drawer Logic ---------- */}
      {/* Only render drawer logic after client mount to prevent hydration mismatch */}
      {mounted && (
        <>
          {isMobile ? (
            /* MOBILE: Temporary Drawer (Overlays content) */
            <MuiDrawer
              variant="temporary"
              open={drawerOpen}
              onClose={closeDrawer}
              ModalProps={{ keepMounted: true }} // Better open performance on mobile
              sx={{
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                },
              }}
            >
              <Toolbar />
              <Divider />
              <ResponsiveDrawer
                expanded
                onNavigate={closeDrawer} // Close drawer when a link is clicked
                onExternalLinkClick={setExternalLink}
              />
            </MuiDrawer>
          ) : (
            /* DESKTOP: Permanent Mini-Drawer (Pushes content or sits aside) */
            <DesktopDrawer variant="permanent" open={drawerOpen}>
              <DrawerHeader>
                <IconButton onClick={closeDrawer}>
                  {theme.direction === "rtl" ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </DrawerHeader>
              <Divider />
              <ResponsiveDrawer
                expanded={drawerOpen}
                // On Desktop, we typically do NOT close the drawer when navigating
                onNavigate={() => {}}
                onExternalLinkClick={setExternalLink}
              />
            </DesktopDrawer>
          )}
        </>
      )}

      {/* External Link Dialog */}
      <ExternalLinkConfirmDialog
        open={!!externalLink}
        label={externalLink?.label ?? ""}
        onClose={() => setExternalLink(null)}
        onConfirm={() => {
          if (externalLink) {
            window.open(externalLink.url, "_blank", "noopener,noreferrer");
          }
          setExternalLink(null);
        }}
      />
    </Box>
  );
}
