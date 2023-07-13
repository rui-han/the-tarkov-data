"use client";

import Link from "next/link";
import Image from "next/image";

import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
} from "@mui/material";
import Icon from "@mdi/react";
import BSG from "../../public/logos/BSG-logo.png";
import Nikita from "../../public/images/nikita.jpeg";
import {
  mdiAmmunition,
  mdiHome,
  mdiTooltipCheckOutline,
  mdiGithub,
} from "@mdi/js";
import ServerStatus from "./ServerStatus";

// the sidebar drawer
const drawerItems = [
  { to: "/ammunition", text: "Ammunition", iconPath: mdiAmmunition },
  { to: "/hideout", text: "Hideout", iconPath: mdiHome },
  { to: "/quests", text: "Quests", iconPath: mdiTooltipCheckOutline },
];

const drawer = (
  <>
    {/* main pages link */}
    <List>
      {drawerItems.map((item) => (
        <Link
          key={item.to}
          href={item.to}
          style={{ color: "inherit", textDecoration: "inherit", padding: 0 }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <Icon path={item.iconPath} style={{ height: "30px" }} />
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
            <Icon path={mdiGithub} style={{ height: "30px" }} />
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
            {" "}
            <Image
              src={BSG}
              style={{ height: "30px", width: "30px" }}
              alt="Battle State Games"
            />
          </ListItemIcon>
          <ListItemText>BSG</ListItemText>
        </ListItemButton>
      </ListItem>
    </List>
    {/* server status */}
    <List>
      <ListItem>
        <ServerStatus />
      </ListItem>
    </List>
  </>
);

export default drawer;
