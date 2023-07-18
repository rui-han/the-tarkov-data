# Deployed to Vercel at:

https://the-tarkov-data.vercel.app/

# 1. Introduction

The Tarkov Data project is a web application built with React, TypeScript, and Next.js. The application serves as a data lookup platform for the popular game "Escape from Tarkov", providing players with detailed information about in-game elements like ammunition, hideout station requirements, and quest information.

# 2. Technologies Used

This project is built using the following key technologies:

- React: A JavaScript library for building user interfaces.

- TypeScript: A superset of JavaScript that adds static types.

- Next.js: A React framework for server-side rendered applications.

- Apollo Client: Used for integrating GraphQL for data fetching and state management.

- Material-UI (v5) : A React UI framework for styling the application.

- Auth0: Used for authentication.

# 3. GraphQL and Tarkov.dev API

The project utilizes [experimental library for Apollo/client with Nextjs 13.4 app router](https://www.apollographql.com/blog/announcement/frontend/using-apollo-client-with-next-js-13-releasing-an-official-library-to-support-the-app-router/), to fetch data from [Tarkov.dev API](https://tarkov.dev/api/) and manage data caching.

The `useSuspenseQuery` hook from Apollo experimental support is used to perform data fetching in a suspenseful way, allowing components to wait for the data to be available before rendering.

# 4. Installation and Setup

To set up the development environment, follow these steps:

### Clone the project repository from GitHub

```bash
git clone https://github.com/rui-han/the-tarkov-data.git
```

### Navigate to the project root directory

```bash
cd the-tarkov-data/
```

### Install the required dependencies

```bash
npm install
```

## 4.1 User authentication

### Configure auth0

Log nto auth0 through `https://manage.auth0.com/dashboard`, create a new application and select `Regular Web Application` and `Next.js` options.

You will need some details about that application to communicate with Auth0. You can get these details from the `Application Settings` section in the Auth0 dashboard.

You need the following information:

- Domain
- Client ID
- Client Secret

### Configure Callback URLs

A callback URL is a URL in your application where Auth0 redirects the user after they have authenticated. The callback URL for your app must be added to the `Allowed Callback URLs` field in your Application Settings. If this field is not set, users will be unable to log in to the application and will get an error.

### Configure Logout URLs

A logout URL is a URL in your application that Auth0 can return to after the user has been logged out of the authorization server. This is specified in the `returnTo` query parameter. The logout URL for your app must be added to the `Allowed Logout URLs` field in your Application Settings. If this field is not set, users will be unable to log out from the application and will get an error.

## 4.2 Configure Auth0 Next.js SDK

The project uses environment variables for configuration, including API URLs and authentication credentials. Ensure that you have the correct environment variables set up for your development and production environments.

At the root level of the project:

```bash
touch .env.local
```

In the `.env.local` file:

```
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://xxxx.auth0.com'
AUTH0_CLIENT_ID='your auth0 client id'
AUTH0_CLIENT_SECRET='your auth0 client secret'
```

- `AUTH0_SECRET`: A long secret value used to encrypt the session cookie. You can generate a suitable string using openssl rand -hex 32 on the command line.
- `AUTH0_BASE_URL`: The base URL of your application.
- `AUTH0_ISSUER_BASE_URL`: The URL of your Auth0 tenant domain. If you are using a Custom Domain with Auth0, set this to the value of your Custom Domain instead of the value reflected in the "Settings" tab.
- `AUTH0_CLIENT_ID`: Your Auth0 application's Client ID.
- `AUTH0_CLIENT_SECRET`: Your Auth0 application's Client Secret.
  The SDK will read these values from the Node.js process environment and automatically configure itself.

### dynamic API route:

> !Warning: using the legacy pages router here, still waiting for the Next.js 13 app router support from auth0.

```ts
// pages/api/auth/[auth0].tsx
import { handleAuth } from "@auth0/nextjs-auth0";

export default handleAuth();
```

This creates the following routes:

- `/api/auth/login`: The route used to perform login with Auth0.
- `/api/auth/logout`: The route used to log the user out.
- `/api/auth/callback`: The route Auth0 will redirect the user to after a successful login.
- `/api/auth/me`: The route to fetch the user profile from.

### The UserProvider component

On the frontend side, the SDK uses React Context to manage the authentication state of your users.

```ts
// components/layout/TopLevelLayout.tsx
import { UserProvider } from "@auth0/nextjs-auth0/client";

export default function TopLevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider></UserProvider>;
}
```

The authentication state exposed by `UserProvider` can be accessed in any component using the `useUser()` hook.

### User profile information

The Auth0 Next.js SDK helps you retrieve the profile information associated with the logged-in user, such as their name or profile picture, to personalize the user interface. The profile information is available through the `user` property exposed by the `useUser()` hook. Take this `<Profile />` component as an example of how to use it:

```js
import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    user && (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
}
```

The `user` property contains sensitive information and artifacts related to the user's identity. As such, its availability depends on the user's authentication status. To prevent any render errors:

- Ensure that the SDK has completed loading before accessing the `user` property by checking that `isLoading` is `false`.
- Ensure that the SDK has loaded successfully by checking that no error was produced.
- Check the `user` property to ensure that Auth0 has authenticated the user before React renders any component that consumes it.

## 4.3 Start the local development server

```bash
npm run dev
```

Access the website at http://localhost:3000 in your web browser.

# 5. Deployment to Vercel

TODO

# 6. Performance Optimization

TODO

# 7. Testing

TODO
