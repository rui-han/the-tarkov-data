import React from "react";
import { Link } from "react-router-dom";

import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
} from "@mui/material";
import Icon from "@mdi/react";

// icons
import BSG from "../../images/BSG-logo.png";
import Nikita from "../../images/nikita.jpeg";
import EFT from "../../images/EFT-logo.png";
import {
  mdiAmmunition,
  mdiHome,
  mdiTooltipCheckOutline,
  mdiGithub,
} from "@mdi/js";

// the sidebar drawer
const drawerItems = [
  { to: "/ammunition", text: "Ammunition", iconPath: mdiAmmunition },
  { to: "/hideout", text: "Hideout", iconPath: mdiHome },
  { to: "/quests", text: "Quests", iconPath: mdiTooltipCheckOutline },
];

const drawer = (
  <>
    {/* logo, which redirects to home page onclick */}
    <Link
      to="/"
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <img src={EFT} alt="The Tarkov Data" style={{ width: "90%" }} />
    </Link>
    {/* main pages link */}
    <List>
      {drawerItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          text={item.text}
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
            <img src={Nikita} style={{ height: "30px" }} alt="Nikita Buyanov" />
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
            <img
              src={BSG}
              style={{ height: "30px" }}
              alt="Battle State Games"
            />
          </ListItemIcon>
          <ListItemText>BSG</ListItemText>
        </ListItemButton>
      </ListItem>
    </List>
  </>
);

export default drawer;
