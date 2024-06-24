# The Tarkov Data Project

## Deployed Version

Access the live application: https://the-tarkov-data.vercel.app

## 1. Introduction

The Tarkov Data Project is a comprehensive web application designed to offer a rich data lookup platform for the acclaimed game "Escape from Tarkov." It provides players with extensive details about various in-game elements, including ammunition types, hideout station requirements, and quest information. This project leverages the latest web technologies to deliver an intuitive and seamless user experience.

## 2. Technologies Used

The application is built using a stack of modern technologies:

- **React**: A powerful JavaScript library for creating dynamic user interfaces.
- **TypeScript**: An enhanced superset of JavaScript, offering added static type checking.
- **Next.js**: A cutting-edge framework for server-side rendered React applications.
- **Apollo Client**: A comprehensive state management library for JavaScript that enables integration with GraphQL.
- **Material-UI (v5)**: A robust React UI framework that facilitates application styling.
- **Auth0**: A flexible, drop-in solution to add authentication and authorization services to applications.
- **Vercel Postgres**: A serverless SQL database designed to integrate with Vercel Functions and your frontend framework.
- **Prisma**: An open-source next-generation ORM for Node.js & TypeScript.

## 3. Data Handling with GraphQL and Tarkov.dev API

- [Tarkov.dev API](https://tarkov.dev/api/)
- [GraphQL Foundation resources](https://graphql.org/learn/)
- [Tarkov.dev GraphQL playground](https://api.tarkov.dev/)

This project implements an experimental Apollo/client library compatible with Next.js 13.4 app router for efficient data fetching. The data is sourced from the Tarkov.dev API, and Apollo's `useSuspenseQuery` hook is employed for suspense-driven data fetching, ensuring components render only after data availability.

- Checkout [@apollo/experimental-nextjs-app-support](https://www.npmjs.com/package/@apollo/experimental-nextjs-app-support) to know more about how to use apollo client in the Next.js app router.

## 4. Getting Started with Development

### 4.1 Setting Up the Environment

1. Clone the Repository

```bash
git clone https://github.com/rui-han/the-tarkov-data.git
```

2. Navigate to Project Directory

```bash
cd the-tarkov-data/
```

3. Install Dependencies

```bash
npm install
```

4. Run the following command to start the local development server:

```bash
npm run dev
```

Access the application at `http://localhost:3000`

### 4.2 Configuring User Authentication with Auth0 in Next.js

- The [quickstart guide](https://auth0.com/docs/quickstart/webapp/nextjs) from auth0
- Explore the [@auth0/nextjs-auth0](https://auth0.github.io/nextjs-auth0/index.html) APIs

Set up the required environment variables in a `.env` file at the project's root:

```bash
touch .env
```

Include the following variables:

```
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://[your-domain].auth0.com'
AUTH0_CLIENT_ID='[your-client-id]'
AUTH0_CLIENT_SECRET='[your-client-secret]'
```

Add login and logout feature in `./components/users` Next linting rules might suggest using the Link component instead of an anchor tag. The Link component is meant to perform client-side transitions between pages. As the link points to an API route and not to a page, you should keep it as an anchor tag.

```tsx
<a href="/api/auth/login" style={{ color: "inherit", textDecoration: "none" }}>
  <Button
    variant="outlined"
    sx={{
      color: "inherit",
      borderColor: "inherit",
      fontSize: { xs: "12px", sm: "16px" },
    }}
  >
    LOGIN
  </Button>
</a>
```

> Next linting rules might suggest using the Link component instead of an anchor tag. The Link component is meant to [perform client-side transitions between pages](https://nextjs.org/docs/pages/api-reference/components/link). As the link points to an API route and not to a page, you should keep it as an anchor tag.

### 4.3 Vercel Postgres

Vercel Postgres is a serverless SQL database designed to integrate with Vercel Functions and your frontend framework.

- [The Vercel Postgres Quickstart](https://vercel.com/docs/storage/vercel-postgres/quickstart)
- [The Vercel Postgres SDK](https://vercel.com/docs/storage/vercel-postgres/sdk)

Add the following environment variables to your `touch .env` file:

```
POSTGRES_URL="[your vercel postgres url]"
POSTGRES_PRISMA_URL="[your postgres prisma url]"
POSTGRES_URL_NO_SSL="[no ssl url]"
POSTGRES_URL_NON_POOLING="[non pooling url]"
POSTGRES_USER="default"
POSTGRES_HOST="[your postgres host]"
POSTGRES_PASSWORD="[your postgres password]"
POSTGRES_DATABASE="verceldb"
```

### 4.4 Prisma ORM

- Checkout Vercel Postgres documentation: [Using an ORM to access your Postgres database](https://vercel.com/docs/storage/vercel-postgres/using-an-orm)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart) using a plain TypeScript project and a local SQLite database file. It covers data modeling, migrations and querying a database.
- [Prisma Client CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Best practice for instantiating Prisma Client with Next.js](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices)

## 5. Deployment to Vercel

Add this script in `package.json` file:

```json
"scripts": {
  "vercel-build": "prisma generate && prisma db push && next build",
}
```

[Deploying Git Repositories with Vercel](https://vercel.com/docs/deployments/git): Vercel allows for automatic deployments on every branch push and merges onto the production branch of your GitHub, GitLab, and Bitbucket projects.

## 6. Performance Optimization

### 6.1 Using `useMemo()` in AmmoTable component

`useMemo()` is used to memoize (or cache) the result of a computation. It only recomputes the memoized value when one of the dependencies has changed.

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

In this case, `visibleRows` is being memoized. Filtering and sorting operations can be expensive, especially with large datasets. `useMemo()` ensures these operations only run when necessary. Pagination operations (the slice part) are optimized, only recalculating when the page or rows per page changes.

The dependencies array `[ammo, currentCaliber, inputText, order, orderBy, page, rowsPerPage]` tells React when to recompute `visibleRows`. The computation will only run if any of these values change.

Without `useMemo()`, this computation would run on every render of the AmmoTable component, even if none of the relevant data has changed. This could be inefficient, especially if the ammo array is large or the filtering/sorting operation is complex.

When it helps?

- When the parent component re-renders but none of the dependencies change, `visibleRows` will return the previously computed result instead of recalculating.

- When only unrelated state in the AmmoTable component changes (e.g., some UI state that doesn't affect the table data), `visibleRows` won't be recalculated.

## 7. Testing

TODO
