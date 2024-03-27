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

## 3. Data Handling with GraphQL and Tarkov.dev API

This project implements an experimental Apollo/client library compatible with Next.js 13.4 app router for efficient data fetching. The data is sourced from the Tarkov.dev API, and Apollo's `useSuspenseQuery` hook is employed for suspense-driven data fetching, ensuring components render only after data availability.

## 4. Getting Started with Development

### 4.1 Setting Up the Environment

- **Clone the Repository**

```bash
git clone https://github.com/rui-han/the-tarkov-data.git
```

- **Navigate to Project Directory**

```bash
cd the-tarkov-data/
```

- **Install Dependencies**

```bash
npm install
```

### 4.2 Configuring User Authentication with Auth0

- **Auth0 Setup**: Register and configure a new application on the Auth0 Dashboard.
- **Necessary Credentials**: Domain, Client ID, Client Secret
- **Configure Callback and Logout URLs**: Set your application's callback and logout URLs in the Auth0 Application Settings.

### 4.3 Environment Variables

Set up the required environment variables in a `.env.local` file at the project's root:

```bash
touch .env.local
```

Include the following variables:

```
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://[your-domain].auth0.com'
AUTH0_CLIENT_ID='[your-client-id]'
AUTH0_CLIENT_SECRET='[your-client-secret]'
```

### 4.4 Implementing Auth0 in Next.js

- **User Authentication Routes**: Implement dynamic API routes using handleAuth from @auth0/nextjs-auth0.

- **UserProvider Component**: Integrate Auth0's UserProvider component for managing authentication state within React components.

```ts
// components/layout/TopLevelLayout.tsx
import { UserProvider } from "@auth0/nextjs-auth0/client";

export default function TopLevelLayout({ children }) {
  return <UserProvider>{children}</UserProvider>;
}
```

- **Accessing User Profile**: Utilize the useUser() hook from Auth0 SDK to access user profile information and personalize the UI.

```ts
// Example: Profile Component
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

### 4.5 Starting the Development Server

Run the following command to start the local development server:

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## 5. Deployment to Vercel

TODO

## 6. Performance Optimization

TODO

## 7. Testing

TODO
