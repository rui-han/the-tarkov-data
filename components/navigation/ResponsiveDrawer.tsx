"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Box,
} from "@mui/material";
import Icon from "@mdi/react";
import BSG from "../../public/logos/BSG-logo.png";
import Nikita from "../../public/images/nikita.jpeg";
import ServerStatus from "./ServerStatus";
// import EFT from "../../public/logos/EFT-logo.png";
import RaidTime from "./RaidTime";

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

// the sidebar drawer
const drawerItems = [
  { to: "/ammunition", text: "Ammunition", iconPath: mdiAmmunition },
  { to: "/hideout", text: "Hideout", iconPath: mdiHome },
  { to: "/items", text: "Items", iconPath: mdiPackageVariant },
  { to: "/quests", text: "Quests", iconPath: mdiTooltipCheckOutline },
  // TODO
  { to: "/achievements", text: "Achievements", iconPath: mdiTrophy },
  { to: "/maps", text: "Maps", iconPath: mdiMap },
];

// icon style
const ICON_STYLE = {
  color: "#aeaeb0",
  height: "30px",
  width: "30px",
};

interface ResponsiveDrawerProps {
  drawerWidth: number;
  open: boolean;
}

export default function ResponsiveDrawer({
  drawerWidth,
  open,
}: ResponsiveDrawerProps) {
  const currentRoute = usePathname();

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* main pages link */}
      <Box sx={{ flexGrow: 1 }}>
        <List>
          {drawerItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              style={{
                color: "inherit",
                textDecoration: "inherit",
                padding: 0,
              }}
            >
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={{
                    backgroundColor:
                      currentRoute === item.to
                        ? "rgba(219, 223, 234, 0.2)"
                        : "",
                    my: 0.5, // increase gap
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.25)",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <Icon path={item.iconPath} style={ICON_STYLE} />
                  </ListItemIcon>
                  {item.text}
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>

        <Divider />
        {/* Github link */}
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() =>
                window.open("https://github.com/rui-han/the-tarkov-data")
              }
            >
              <ListItemIcon>
                <Icon path={mdiGithub} style={ICON_STYLE} />
              </ListItemIcon>
              <ListItemText>Github</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        {/* social media links */}
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => window.open("https://twitter.com/nikgeneburn")}
            >
              <ListItemIcon>
                <Image
                  src={Nikita}
                  style={{ height: "30px", width: "30px" }}
                  alt="Nikita Buyanov"
                />
              </ListItemIcon>
              <ListItemText>Nikita</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => window.open("https://twitter.com/bstategames")}
            >
              <ListItemIcon>
                <Image src={BSG} style={ICON_STYLE} alt="Battle State Games" />
              </ListItemIcon>
              <ListItemText>BSG</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        {/* server status */}
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() =>
                window.open(
                  "https://status.escapefromtarkov.com/",
                  "_blank",
                  "noopener,noreferrer",
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
        <Divider />
      </Box>
      {/* raid time */}
      <Box
        sx={{
          mt: "auto",
          width: "100%",
          display: open ? "flex" : "none",
          justifyContent: "center",
          p: 1,
        }}
      >
        <List>
          <ListItem>
            <RaidTime />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
