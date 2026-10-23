# The Tarkov Data Project

A data lookup web app for the game _Escape from Tarkov_: ammunition stats, items and flea prices, tasks, hideout upgrade requirements and costs, server status, and a personal dashboard with a price watchlist. Everything is read from the static JSON files served by [json.tarkov.dev](https://json.tarkov.dev), and every page follows a global game mode switch (PvP / PvE / PvP Season).

## Deployed Version

🚀 **Live application:** [https://the-tarkov-data.vercel.app](https://the-tarkov-data.vercel.app)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Data Source](#data-source)
  - [Endpoints in use](#endpoints-in-use)
  - [Data shape and translations](#data-shape-and-translations)
  - [Game modes](#game-modes)
- [Architecture](#architecture)
  - [Project structure](#project-structure)
  - [Data flow](#data-flow)
  - [Favorites and the watchlist](#favorites-and-the-watchlist)
  - [Rate limiting and security](#rate-limiting-and-security)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Testing](#testing)
- [Known Issues and Roadmap](#known-issues-and-roadmap)
- [Acknowledgements](#acknowledgements)

---

## Features

- **Game mode switch.** PvP, PvE and PvP Season, picked in the top bar (with a confirmation dialog) and remembered in the browser. All data pages follow it.
- **Ammunition.** Sortable, filterable table by caliber with search and pagination. Favorite any round.
- **Items.** Every item with flea price, 48h price change, weight, category and the best trader buy-back price. Multi-word search (name, short name), category filter, sorting on every numeric column, infinite scroll, favorites.
- **Tasks.** Table with search and trader / map / Kappa / Lightkeeper filters, sorting and pagination. Each row expands to show objectives, requirements (prerequisite tasks, trader levels) and rewards. Reward item names are loaded on demand.
- **Hideout.** Station navigation, level switcher, prerequisites (stations, traders, skills) that link to each other, an item table with Found-in-Raid markers, unit prices and an estimated total cost per level. `/hideout` opens a default station.
- **Dashboard** (login required):
  - **Watchlist:** every favorited item with flea price, 48h change and trader sell price, plus a summary (items rising / falling, combined flea price). Search, sort and undoable removal.
  - **Ammo:** favorite ammunition as comparison cards.
- **Server status.** The sidebar shows the overall EFT server status, with per-service details on hover, refreshed every minute. When the sidebar is collapsed, the status shows as a badge on the server icon.
- **Raid clock** in the sidebar, and a **feedback form** on the home page.
- **User accounts** through Auth0.

## Tech Stack

| Technology                           | Role                                                                   |
| :----------------------------------- | :--------------------------------------------------------------------- |
| **Next.js 14** (App Router)          | Framework, routing, API routes, middleware                             |
| **React 18 + TypeScript**            | UI and type safety                                                     |
| **SWR**                              | Data fetching and caching for the JSON endpoints                       |
| **Material-UI v5**                   | Component library and dark theme                                       |
| **Auth0** (`@auth0/nextjs-auth0` v3) | Authentication                                                         |
| **Prisma + Vercel Postgres**         | Users, favorites and feedback                                          |
| **Upstash Redis** (optional)         | Distributed rate limiting; falls back to in-memory limiting without it |
| **Vitest + React Testing Library**   | Unit and component tests                                               |

## Data Source

All game data comes from the static JSON files at [json.tarkov.dev](https://json.tarkov.dev). The endpoint catalog (available endpoints, game modes and languages) is published at [json.tarkov.dev/endpoints](https://json.tarkov.dev/endpoints); check it first when something is missing.

URL pattern:

```
https://json.tarkov.dev/{gameMode}/{endpoint}          # structure
https://json.tarkov.dev/{gameMode}/{endpoint}_{lang}   # translation dictionary
https://json.tarkov.dev/status                         # not per game mode
```

The previous GraphQL API is no longer used.

### Endpoints in use

| Endpoint                                                      | Used by                                                                  |
| :------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `items`                                                       | Ammunition, Items, Dashboard watchlist, hideout costs, task reward names |
| `tasks`                                                       | Tasks                                                                    |
| `hideout`                                                     | Hideout                                                                  |
| `traders`                                                     | Trader names and icons across pages                                      |
| `maps`                                                        | Task map names and filter                                                |
| `status`                                                      | Sidebar server status                                                    |
| `items_en`, `tasks_en`, `hideout_en`, `traders_en`, `maps_en` | English text for the endpoints above (see below)                         |

### Data shape and translations

The files are **not** shaped like the old GraphQL responses:

- The payload is wrapped in `{ "data": ... }`, and collections are **objects keyed by id**, not arrays (`{ "<id>": { ... } }`).
- **Relations are plain ids**, not nested objects. A task has `trader: "<traderId>"` and `map: "<mapId>"`; a hideout requirement has `item: "<itemId>"`. Names, icons and prices are joined on the client from the other endpoints.
- **Text fields are translation keys**, e.g. `"5447ac644bdc2d6c208b4567 Name"` or `"hideout_area_23_name"`. The `*_en` file is a flat dictionary (`key → English text`), **not** a translated copy of the data, so structure always comes from the plain endpoint and text from the dictionary.

This is handled in one place per domain (`lib/hideout.ts`, `lib/items.ts`, `lib/tasks.ts`, `lib/serverStatus.ts`):

- Parsers are defensive: unknown shapes produce empty results instead of crashes, and each hook logs a console warning when a payload parses to nothing.
- Name resolution order: dictionary entry, then the raw value if it is already readable, then a prettified `normalizedName` (`air-filtering-unit` → `Air Filtering Unit`). Pages therefore stay readable even if a dictionary fails to load, and a dictionary never blocks rendering.
- Dictionaries are always read from `regular`, since the keys are shared across game modes.

### Game modes

The three modes are `regular` (shown as PvP), `pve` and `pvp-season`. The selected mode lives in `GameModeContext` and is stored in `localStorage`. `useTarkovData` reads it, includes it in the SWR cache key (switching back is instant) and waits until the saved mode has been read, so a PvE user never downloads the PvP files first. Endpoints that don't depend on the mode (`status`, the dictionaries) pin their mode explicitly.

Not every endpoint is guaranteed to exist for every mode (for example, Season data can be missing or empty when no season is active); pages show their normal error state in that case.

## Architecture

### Project structure

```
app/
  layout.tsx, page.tsx            # root layout, home page
  ammunition/  items/  tasks/     # data pages
  hideout/                        # layout (station nav), index redirect, [hideoutId]
  achievements/                   # see Known Issues
  dashboard/                      # watchlist + ammo tabs
  api/
    auth/[auth0]/                 # Auth0 handlers (creates the user on first login)
    feedback/                     # anonymous or logged-in feedback
    users/ammo/                   # favorites: get / add / remove (works for any item)
components/
  ammunition/ hideout/ home/ items/ layout/ navigation/ skeleton/ tasks/ users/
contexts/GameModeContext.tsx      # selected game mode + persistence
hooks/                            # useTarkovData, useTranslations, useItems, useTasks,
                                  # useHideoutData, useAmmoData, useFavorites,
                                  # useServerStatus, useItemSort, useDebouncedValue, ...
lib/                              # tarkovApi (fetch), hideout, items, tasks, serverStatus
                                  # (pure parsing / join / filter / sort functions)
prisma/                           # schema.prisma, migrations, client singleton
types/                            # shared TypeScript types
tests/                            # mirrors the source layout
middleware.ts                     # security headers, IP blocklist, global rate limit
ratelimit.ts                      # route-level limiter with in-memory fallback
```

### Data flow

```
json.tarkov.dev ──fetchTarkovJson──▶ useTarkovData (SWR, keyed by endpoint + mode + lang)
                                          │
                     hooks (useItems, useTasks, useHideoutStations, ...)
                                          │  parse + join + resolve names
                                          ▼
                              lib/* pure functions ──▶ components
```

- Components never see raw payloads, only normalized objects.
- Parsing and filtering are pure functions in `lib/`, which is where most of the tests are.
- Heavy derived data is memoized. Hideout pages keep only the few dozen items they reference out of the full items file; task reward names are fetched only when a task with item rewards is expanded.
- The items file is large. All pages share it through the SWR cache, so it is downloaded once per game mode.

### Favorites and the watchlist

- Favorites are stored in the `FavoriteItems` table by `itemId`, so **any item** can be favorited (ammo is just items of type `ammo`). The API routes still live under `/api/users/ammo/*` for historical reasons.
- `useFavorites` is optimistic: the heart changes immediately and is rolled back if the request fails. The server caps a user at 200 favorites (HTTP 409 beyond that) and validates the id format.
- Only ids are stored. Names and prices are joined from the current game mode's data, so a favorite that doesn't exist in the selected mode appears as "Item details unavailable" and can be removed manually.
- The dashboard only loads item data for logged-in users.

### Rate limiting and security

- `middleware.ts` applies security headers, an optional IP prefix blocklist (`BLOCKED_IP_PREFIXES`), and a coarse global limit (120 requests per minute per IP, prefetch requests excluded). `/debug` is hidden in production.
- Mutating API routes and the Auth0 callback have their own tighter limits (`ratelimit.ts`).
- **Redis is optional.** Without Upstash credentials the limiter falls back to an in-memory one, which is fine for local development but ineffective on serverless (each instance counts separately). If Redis is configured but unreachable, the limiters fail open and log an error, so an outage doesn't take down login or favorites. Configure Upstash for any real deployment.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- npm or yarn
- An [Auth0](https://auth0.com/) application
- A Postgres database (the project uses [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres))
- Optional: an [Upstash](https://upstash.com/) Redis database for rate limiting

### Installation

```bash
git clone https://github.com/rui-han/the-tarkov-data.git
cd the-tarkov-data
npm install
```

### Environment configuration

Create a `.env` file in the project root:

```sh
# Auth0 (https://auth0.com/docs/quickstart/webapp/nextjs)
# Generate a secret with: openssl rand -hex 32
AUTH0_SECRET='YOUR_AUTH0_SECRET'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://[your-domain].auth0.com'
AUTH0_CLIENT_ID='[your-auth0-client-id]'
AUTH0_CLIENT_SECRET='[your-auth0-client-secret]'

# Vercel Postgres / Prisma
POSTGRES_URL="[your-vercel-postgres-url]"
POSTGRES_PRISMA_URL="[your-postgres-prisma-url]"
POSTGRES_URL_NO_SSL="[your-no-ssl-url]"
POSTGRES_URL_NON_POOLING="[your-non-pooling-url]"
POSTGRES_USER="default"
POSTGRES_HOST="[your-postgres-host]"
POSTGRES_PASSWORD="[your-postgres-password]"
POSTGRES_DATABASE="verceldb"

# Optional: Upstash Redis for rate limiting.
# Leave both unset (or delete them) to use the in-memory fallback.
# Don't keep values that point at a deleted database.
UPSTASH_REDIS_REST_URL="[your-upstash-redis-rest-url]"
UPSTASH_REDIS_REST_TOKEN="[your-upstash-redis-rest-token]"

# Optional: comma-separated IP prefixes to block in middleware, e.g. "74.7.,1.2.3."
BLOCKED_IP_PREFIXES=""
```

> **Auth0 login/logout links:** the Next.js linter may suggest replacing `<a href="/api/auth/login">` with `<Link>`. Ignore it: `Link` is for client-side page navigation, and these links point to API routes, so a plain anchor is correct.

> **Prisma:** `PrismaClient` is instantiated as a singleton (`prisma/db.ts`) to avoid exhausting connections during hot reloads. [Learn more](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices).

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

The project is built for [Vercel](https://vercel.com/).

1. Import the repository into Vercel.
2. Add all the environment variables above. Set `AUTH0_BASE_URL` to the production URL.
3. The build uses the `vercel-build` script from `package.json`:

   ```json
   "vercel-build": "prisma generate && prisma db push && next build"
   ```

   Note that `prisma db push` syncs the schema without using the migration history. If you rely on the files in `prisma/migrations`, `prisma migrate deploy` is the safer choice for production.

Every push to `main` deploys automatically. All routes render dynamically (`force-dynamic` in the root layout) and game data is fetched in the browser, so a json.tarkov.dev outage doesn't fail the build.

## Testing

[Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

```bash
npm test          # run once
npm run test:watch
```

### Conventions

- Tests live under `tests/`, mirroring the source layout (`tests/lib/items.test.ts` tests `lib/items.ts`).
- Prefer testing pure functions and hooks directly. Use component tests where there is real interaction or conditional rendering. Assert on visible behavior, not implementation details.
- `jsdom` is the test environment. The `@/*` import alias is configured manually in `vitest.config.ts` (it mirrors `tsconfig.json`).

### Current coverage

- `lib/hideout.ts`, `lib/items.ts`, `lib/tasks.ts`, `lib/serverStatus.ts`: parsing the real payload shapes, translation fallback, filtering, sorting, cost and summary calculations.
- `utils/ammo-utils.ts`, `utils/achievement-utils.ts`, `hooks/useAchievementSort.ts`.
- `hooks/useFavorites.ts`: optimistic updates, rollback, error bodies, the favorites cap.
- `contexts/GameModeContext.tsx` and `components/navigation/GameModeSwitch.tsx`: persistence and the confirmation flow.
- `components/ammunition/AmmoSearchbar.tsx`.

Good next candidates: `fetchTarkovJson` (with `fetch` mocked), `useTarkovData`, and the API routes under `app/api/` (with Prisma mocked).

## Known Issues and Roadmap

- **Achievements page** still reads the old `tasks` endpoint and a field that no longer exists; it needs to move to its own endpoint (plus translations) like the other pages.
- **`/maps`** is linked in the sidebar but has no page yet.
- **Account linking:** `User.email` is unique, so the same email logging in through two different Auth0 identities fails on user creation.
- **Dependencies** are behind: Next 14, Auth0 SDK v3, MUI 5, TypeScript 5.1. Upgrade after the data migration has settled, one step at a time.
- **Server status codes:** `status` is mapped as 0 = OK, 1 = Updating, 2 = Issues, 3 = Down (only `0` has been confirmed against live data); anything else is shown as unknown.
- **Ideas:** task and hideout progress tracking with a "available now" task list, a hideout shopping list, ammo comparison, and a player profile (level, faction) in Settings.

## Acknowledgements

- Game data from [tarkov.dev](https://tarkov.dev) (static JSON at [json.tarkov.dev](https://json.tarkov.dev)).
- Built with Next.js, Vercel, Auth0, Prisma and Upstash.
- _Escape from Tarkov_ is a trademark of Battlestate Games. This project is unofficial and not affiliated with them.
