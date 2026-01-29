"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

// components
import ServerStatus from "./ServerStatus";
import RaidTime from "./RaidTime";

// MUI
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import Icon from "@mdi/react";

// icons
import {
  mdiAmmunition,
  mdiHome,
  mdiTooltipCheckOutline,
  mdiGithub,
  mdiServer,
  mdiPackageVariant,
  mdiTrophy,
  mdiMap,
} from "@mdi/js";

// images
import BSG from "../../public/logos/BSG-logo.png";
import Nikita from "../../public/images/nikita.jpeg";

/**
 * Navigation item config (data-driven)
 */
const drawerItems = [
  { to: "/ammunition", text: "Ammunition", icon: mdiAmmunition },
  { to: "/hideout", text: "Hideout", icon: mdiHome },
  { to: "/items", text: "Items", icon: mdiPackageVariant },
  { to: "/tasks", text: "Tasks", icon: mdiTooltipCheckOutline },
  { to: "/achievements", text: "Achievements", icon: mdiTrophy },
  { to: "/maps", text: "Maps", icon: mdiMap },
];

const ICON_STYLE = {
  color: "#aeaeb0",
  width: 30,
  height: 30,
};

interface ResponsiveDrawerProps {
  /** Called after internal navigation (useful for closing mobile drawer) */
  onNavigate?: () => void;

  /** Called when user clicks external link */
  onExternalLinkClick?: (link: { url: string; label: string }) => void;

  /** Whether drawer is expanded (only affects bottom content visibility) */
  expanded?: boolean;
}

/**
 * Responsive navigation drawer content
 */
export default function ResponsiveDrawer({
  onNavigate,
  onExternalLinkClick,
  expanded = true,
}: ResponsiveDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Track which route is currently navigating
   * Used for spinner feedback
   */
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  /**
   * Reset loading state on route change
   */
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  /**
   * Handle internal navigation
   */
  const handleNavigate = useCallback(
    (to: string) => {
      setLoadingPath(to);
      router.push(to);
      onNavigate?.();
    },
    [router, onNavigate],
  );

  /**
   * Handle external link click
   */
  const handleExternalClick = (
    e: React.MouseEvent,
    url: string,
    label: string,
  ) => {
    e.stopPropagation();
    onExternalLinkClick?.({ url, label });
  };

  /**
   * Determine active route styling
   */
  const isActive = (to: string) =>
    loadingPath === to || pathname.startsWith(to);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ---------- Main navigation ---------- */}
      <Box sx={{ flexGrow: 1 }}>
        <List>
          {drawerItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.to)}
                selected={isActive(item.to)}
                sx={{ my: 0.5, borderRadius: 1 }}
              >
                <ListItemIcon>
                  {loadingPath === item.to ? (
                    <CircularProgress size={22} />
                  ) : (
                    <Icon path={item.icon} style={ICON_STYLE} />
                  )}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* ---------- External links ---------- */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={(e) =>
                handleExternalClick(
                  e,
                  "https://github.com/rui-han/the-tarkov-data",
                  "GitHub",
                )
              }
            >
              <ListItemIcon>
                <Icon path={mdiGithub} style={ICON_STYLE} />
              </ListItemIcon>
              <ListItemText primary="GitHub" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        {/* ---------- Social ---------- */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={(e) =>
                handleExternalClick(
                  e,
                  "https://twitter.com/nikgeneburn",
                  "Nikita Twitter",
                )
              }
            >
              <ListItemIcon>
                <Image src={Nikita} alt="Nikita" width={30} height={30} />
              </ListItemIcon>
              <ListItemText primary="Nikita" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={(e) =>
                handleExternalClick(
                  e,
                  "https://twitter.com/bstategames",
                  "BSG Twitter",
                )
              }
            >
              <ListItemIcon>
                <Image src={BSG} alt="BSG" width={30} height={30} />
              </ListItemIcon>
              <ListItemText primary="BSG" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        {/* ---------- Server status ---------- */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={(e) =>
                handleExternalClick(
                  e,
                  "https://status.escapefromtarkov.com/",
                  "Server Status",
                )
              }
            >
              <ListItemIcon>
                <Icon path={mdiServer} style={ICON_STYLE} />
              </ListItemIcon>
              <ServerStatus />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* ---------- Bottom content ---------- */}
      {expanded && (
        <Box
          sx={{
            mt: "auto",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            p: 1,
          }}
        >
          <RaidTime />
        </Box>
      )}
    </Box>
  );
}
