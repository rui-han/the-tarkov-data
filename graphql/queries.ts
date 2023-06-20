import { gql } from "@apollo/client";

export const GET_SERVER_STATUS = gql`
  query GET_SERVER_STATUS {
    status {
      generalStatus {
        name
        message
        status
      }
      messages {
        time
        type
        content
        solveTime
      }
    }
  }
`;

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
