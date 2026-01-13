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
  query GET_HIDEOUT_DATA {
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

export const GET_AMMO_DATA = gql`
  query GET_AMMO_DATA {
    ammo {
      caliber
      ammoType
      projectileCount
      item {
        id
        name
        inspectImageLink
      }
      damage
      penetrationPower
      armorDamage
      accuracyModifier
      recoilModifier
    }
  }
`;

export const GET_ALL_ITEMS_DATA = gql`
  query GET_ITEM_DATA {
    items {
      id
      name
      lastLowPrice
      sellFor {
        vendor {
          name
        }
        priceRUB
      }
    }
  }
`;

export const GET_PAGINATED_ITEMS_DATA = gql`
  query GET_PAGINATED_ITEMS_DATA($limit: Int, $offset: Int) {
    items(limit: $limit, offset: $offset) {
      id
      gridImageLink
      wikiLink
      name
      normalizedName
      category {
        id
        name
      }
      weight
      lastLowPrice
    }
  }
`;

export const GET_ACHIEVEMENT_DATA = gql`
  query GET_ACHIEVEMENT_DATA {
    achievements {
      id
      name
      description
      hidden
      playersCompletedPercent
      adjustedPlayersCompletedPercent
      side
      normalizedSide
      rarity
      normalizedRarity
      imageLink
    }
  }
`;

export const GET_TASKS_DATA = gql`
  query GET_TASKS_DATA {
    tasks {
      id
      name
      normalizedName
      trader {
        name
      }
      map {
        name
      }
      experience
      taskImageLink
      minPlayerLevel
      taskRequirements {
        task {
          name
        }
      }
      kappaRequired
    }
  }
`;
