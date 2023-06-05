import { gql } from "@apollo/client";

export const GET_HIDEOUT_DATA = gql`
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
