import React from "react";
import { Outlet } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

import HideoutNav from "./HideoutNav";

const GET_HIDEOUT_DATA = gql`
  query GetHideoutData {
    hideoutStations {
      id
      name
      normalizedName
      levels {
        id
        level
        constructionTime
        stationLevelRequirements {
          id
          station {
            name
            normalizedName
          }
          level
        }
        traderRequirements {
          trader {
            id
            name
            normalizedName
          }
          level
        }
        itemRequirements {
          id
          item {
            name
            iconLink
            low24hPrice
            avg24hPrice
          }
          quantity
        }
      }
    }
  }
`;

export default function HideoutPage() {
  const { data, loading, error } = useQuery(GET_HIDEOUT_DATA);

  if (loading) return <h3>Loading...</h3>;
  if (error) return <h3>Error : {error.message}</h3>;

  const hideoutData = data.hideoutStations;

  return (
    <>
      <HideoutNav hideoutData={hideoutData} />
      <Outlet context={{ hideoutData }} />
    </>
  );
}
