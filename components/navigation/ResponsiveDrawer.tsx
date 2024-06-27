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
import EFT from "../../public/logos/EFT-logo.png";
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
  // color: "#b5a27f",
  height: "30px",
  width: "30px",
};

interface ResponsiveDrawerProps {
  drawerWidth: number;
}

export default function ResponsiveDrawer({
  drawerWidth,
}: ResponsiveDrawerProps) {
  const currentRoute = usePathname();

  return (
    <>
      <Box
        sx={{
          width: drawerWidth,
          mt: "2vh",
          display: { xs: "flex", sm: "none" },
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

      {/* main pages link */}
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
            <ListItem>
              <ListItemButton
                sx={{
                  backgroundColor:
                    currentRoute === item.to ? "rgba(219, 223, 234, 0.2)" : "",
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
        <ListItem>
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
        <ListItem>
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
        <ListItem>
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
        <ListItem>
          <ListItemButton
            onClick={() =>
              window.open(
                "https://github.com/rui-han/the-tarkov-data",
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
      {/* raid time */}
      <List>
        <ListItem>
          <Box
            sx={{
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <RaidTime />
          </Box>
        </ListItem>
      </List>
    </>
  );
}
