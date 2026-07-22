# The Tarkov Data Project

A comprehensive web application designed as a rich data lookup platform for the game "Escape from Tarkov". This project provides players with extensive details about in-game items, quest requirements, hideout modules, and more, leveraging modern web technologies to deliver a fast, intuitive, and seamless user experience.

## Deployed Version

🚀 **Access the live application:** [https://the-tarkov-data.vercel.app](https://the-tarkov-data.vercel.app)

---

## Table of Contents

- [Features](https://www.google.com/search?q=%231-features)
- [Tech Stack](https://www.google.com/search?q=%232-tech-stack)
- [Core Concepts](https://www.google.com/search?q=%233-core-concepts)
  - [Data Fetching with GraphQL](https://www.google.com/search?q=%2331-data-fetching-with-graphql)
  - [Performance Optimization with `useMemo`](https://www.google.com/search?q=%2332-performance-optimization-with-usememo)
- [Getting Started](https://www.google.com/search?q=%234-getting-started)
  - [Prerequisites](https://www.google.com/search?q=%2341-prerequisites)
  - [Installation](https://www.google.com/search?q=%2342-installation)
  - [Environment Configuration](https://www.google.com/search?q=%2343-environment-configuration)
  - [Run the Development Server](https://www.google.com/search?q=%2344-run-the-development-server)
- [Deployment](https://www.google.com/search?q=%235-deployment)
- [Testing](https://www.google.com/search?q=%236-testing)
- [Acknowledgements](https://www.google.com/search?q=%237-acknowledgements)

---

## 1\. Features

- **Ammunition Stats:** Detailed tables for all ammo types, with advanced sorting and filtering by caliber.
- **Quest Tracking:** Comprehensive information on quests, objectives, and rewards.
- **Hideout Requirements:** A clear breakdown of items and levels needed for hideout upgrades.
- **User Authentication:** Secure login system powered by Auth0 to manage user-specific data in the future.

## 2\. Tech Stack

The application is built using a modern, robust, and scalable technology stack:

| Technology                | Description                                                                                                    |
| :------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **React**                  | A powerful JavaScript library for building dynamic and responsive user interfaces.                             |
| **TypeScript**             | A strongly typed superset of JavaScript that enhances code quality and maintainability.                        |
| **Next.js**                | A cutting-edge React framework for server-side rendering (SSR), static site generation (SSG), and performance. |
| **Apollo Client**          | A comprehensive state management library for managing both local and remote data with GraphQL.                 |
| **Material-UI (v5)**       | A popular and robust React UI framework for creating a consistent and accessible design system.                |
| **Auth0**                  | A flexible, drop-in solution to add authentication and authorization services.                                 |
| **Vercel Postgres**        | A serverless SQL database designed to integrate seamlessly with Vercel and modern frontend frameworks.         |
| **Prisma**                 | A next-generation ORM for Node.js and TypeScript that simplifies database access and management.               |
| **Upstash Redis**          | A serverless Redis used to power request rate limiting across API routes and middleware.                       |
| **Vitest**                 | A fast, Vite-powered unit test runner used for testing pure functions, hooks, and components.                  |
| **React Testing Library**  | A testing utility encouraging tests that resemble how users actually interact with components.                 |

## 3\. Core Concepts

### 3.1 Data Fetching with GraphQL

This project sources all its "Escape from Tarkov" data from the excellent [Tarkov.dev API](https://tarkov.dev/api/), which exposes a GraphQL endpoint.

We use an experimental Apollo Client library specifically designed for the Next.js 13 App Router: `[@apollo/experimental-nextjs-app-support](https://www.npmjs.com/package/@apollo/experimental-nextjs-app-support)`.

Data fetching is managed with suspense-driven queries via the `useSuspenseQuery` hook. This ensures that components only attempt to render after their required data is available, simplifying loading state management and preventing data-related race conditions.

- Explore the API using the [Tarkov.dev GraphQL Playground](https://api.tarkov.dev/).
- Learn more about GraphQL at the [GraphQL Foundation](https://graphql.org/learn/).

### 3.2 Performance Optimization with `useMemo`

To ensure a smooth user experience, especially on data-heavy pages like the `AmmoTable` component, we leverage React's `useMemo` hook to prevent expensive recalculations on every render.

```tsx
const visibleRows = useMemo(() => {
  const filteredAndSortedAmmo = filterAndSortAmmo(
    ammo,
    currentCaliber,
    inputText,
    order,
    orderBy,
  );

  return filteredAndSortedAmmo.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
}, [ammo, currentCaliber, inputText, order, orderBy, page, rowsPerPage]);
```

**Why is this important?**

The `visibleRows` constant holds the data displayed in the table. Its calculation involves potentially expensive filtering and sorting operations. By wrapping this logic in `useMemo`, we cache the result. The calculation only re-runs if a value in its dependency array `[ammo, currentCaliber, ...]` changes.

**The Benefit:**

Without `useMemo`, these operations would execute on every single component render, even those triggered by unrelated state changes. This memoization ensures that if a parent component re-renders or local state changes, we use the cached `visibleRows` value, saving computation and preventing UI lag.

## 4\. Getting Started

Follow these instructions to set up the project for local development.

### 4.1 Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- An account with [Auth0](https://auth0.com/), [Vercel](https://vercel.com/) (for Postgres database), and [Upstash](https://upstash.com/) (for Redis-backed rate limiting).

### 4.2 Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/rui-han/the-tarkov-data.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd the-tarkov-data
    ```

3.  **Install project dependencies:**

    ```bash
    npm install
    ```

### 4.3 Environment Configuration

This project requires several environment variables for database connections and authentication services.

1.  **Create a `.env` file in the root of the project:**

    ```bash
    touch .env
    ```

2.  **Populate the `.env` file.** Copy the contents of `.env.example` below and replace the placeholder values with your credentials from Auth0, Vercel Postgres, and Upstash.

    ```sh
    # .env.example

    # Auth0 Environment Variables
    # See: https://auth0.com/docs/quickstart/webapp/nextjs
    # Generate a secret with: openssl rand -hex 32
    AUTH0_SECRET='YOUR_AUTH0_SECRET'
    AUTH0_BASE_URL='http://localhost:3000'
    AUTH0_ISSUER_BASE_URL='https://[your-domain].auth0.com'
    AUTH0_CLIENT_ID='[your-auth0-client-id]'
    AUTH0_CLIENT_SECRET='[your-auth0-client-secret]'

    # Vercel Postgres & Prisma Environment Variables
    # See: https://vercel.com/docs/storage/vercel-postgres/quickstart
    POSTGRES_URL="[your-vercel-postgres-url]"
    POSTGRES_PRISMA_URL="[your-postgres-prisma-url]"
    POSTGRES_URL_NO_SSL="[your-no-ssl-url]"
    POSTGRES_URL_NON_POOLING="[your-non-pooling-url]"
    POSTGRES_USER="default"
    POSTGRES_HOST="[your-postgres-host]"
    POSTGRES_PASSWORD="[your-postgres-password]"
    POSTGRES_DATABASE="verceldb"

    # Upstash Redis Environment Variables (rate limiting)
    # See: https://upstash.com/docs/redis/overall/getstarted
    UPSTASH_REDIS_REST_URL="[your-upstash-redis-rest-url]"
    UPSTASH_REDIS_REST_TOKEN="[your-upstash-redis-rest-token]"

    # Optional: comma-separated list of IP prefixes to block at the middleware
    # level, e.g. "74.7.,1.2.3."
    BLOCKED_IP_PREFIXES=""
    ```

    - **Prisma Best Practices:** We follow the recommended best practice for instantiating `PrismaClient` in a Next.js environment to avoid exhausting database connections during development. [Learn more](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices).

> **Note on Auth0 Login/Logout Links:**
> The Next.js linter may suggest replacing `<a href="/api/auth/login">` with the `<Link>` component. This should be ignored. The `Link` component is for client-side navigation between pages, whereas these are links to API routes that handle the authentication flow. Using a standard `<a>` tag is correct here.

### 4.4 Run the Development Server

1.  **Start the local server:**

    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).

## 5\. Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push your repository to GitHub/GitLab/Bitbucket.**

2.  **Import the project into Vercel.** Vercel will automatically detect that it is a Next.js application.

3.  **Configure Environment Variables.** In your Vercel project settings, add all the same environment variables from your local `.env` file. Ensure `AUTH0_BASE_URL` is updated to your production URL.

4.  **Add Build Command Override.** To ensure Prisma generates its client and pushes schema changes on build, update the build command in your Vercel project settings:

    ```bash
    prisma generate && prisma db push && next build
    ```

    Alternatively, add this script to your `package.json` and Vercel will use it automatically:

    ```json
    "scripts": {
      "vercel-build": "prisma generate && prisma db push && next build"
    }
    ```

Vercel will now automatically deploy your project on every push to the `main` branch.

## 6\. Testing

This project uses [Vitest](https://vitest.dev/) together with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and component tests.

### 6.1 Running Tests

```bash
# run the full test suite once
npm test

# re-run tests automatically as files change
npm run test:watch
```

### 6.2 Project Conventions

- Test files live under `tests/`, mirroring the folder structure of the file under test (e.g. `tests/utils/ammo-utils.test.ts` tests `utils/ammo-utils.ts`).
- Prefer testing pure functions and hooks directly — they're fast, deterministic, and don't require mocking the DOM.
- Reach for component tests (`@testing-library/react`) when there's real user interaction or conditional rendering logic worth locking down. Assert on visible behavior (values, callbacks, text) rather than implementation details like class names or component internals.
- `jsdom` is used as the test environment and `vite-tsconfig-paths` resolves the same `@/*` import alias used throughout the app, so tests can import from source the same way application code does.

### 6.3 Current Coverage

The suite is intentionally a starting point rather than full coverage. It currently covers:

- `utils/ammo-utils.ts` — filtering and sorting logic used by the ammunition table
- `utils/achievement-utils.ts` — chip color/style resolution
- `hooks/useAchievementSort.ts` — the generic sortable-table hook
- `components/ammunition/AmmoSearchbar.tsx` — a first example of a component interaction test

Good next candidates for tests include additional edge cases in `filterAndSortAmmo`, the `useFavoriteAmmo` hook (with `fetch` mocked), and the API routes under `app/api/` (with Prisma mocked or run against a test database).

## 7\. Acknowledgements

- Data provided by the [Tarkov.dev API](https://tarkov.dev/api/).
- Built with tools and services from Next.js, Vercel, Auth0, and Upstash.
