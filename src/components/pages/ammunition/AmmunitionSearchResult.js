import { Card, CardContent, Typography } from "@mui/material";
import React from "react";

import RawAmmunitionData from "../../../data/ammunition.json";

const AmmunitionData = Object.values(RawAmmunitionData);

export default function SearchResult(props) {
  let { searchInput } = props;

  let filteredData = AmmunitionData.filter((data) => {
    if (searchInput === "") {
      return searchInput;
    } else if (data.name.toLowerCase().includes(searchInput.toLowerCase())) {
      return data.name;
    }
  });

  return (
    <>
      {filteredData.map((data, index) => (
        <Card key={index} sx={{ maxWidth: "400px", marginTop: "50px" }}>
          <CardContent>
            <Typography>{data.name}</Typography>
            <Typography>Flesh Damage: {data.ballistics.damage}</Typography>
            <Typography>Armor Damage: {data.ballistics.armorDamage}</Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
