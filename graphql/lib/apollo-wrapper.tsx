"use client";

import { tarkov_dev_uri } from "../uri";
import { ApolloLink, HttpLink } from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support";

// have a function to create a client for you
function makeClient() {
  const httpLink = new HttpLink({
    uri: tarkov_dev_uri,
    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    // fetchOptions: { cache: "no-store" },
    // you can override the default `fetchOptions` on a per query basis
    // via the `context` property on the options passed as a second argument
    // to an Apollo Client data fetching hook, e.g.:
    // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
  });

  // Automatically retry transient failures (e.g. a momentary 503 from the
  // upstream Tarkov.dev API) a few times with backoff before giving up.
  // This matters most during `next build`/SSR, where a single flaky
  // request could otherwise fail the whole page render.
  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 3000,
      jitter: true,
    },
    attempts: {
      max: 3,
      retryIf: (error) => !!error,
    },
  });

  // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
    cache: new InMemoryCache(),
    link: retryLink.concat(httpLink),
    defaultOptions: {
      // Return errors alongside (possibly undefined) data instead of
      // throwing during render. This lets pages show a graceful fallback
      // UI via the `error` field instead of crashing the whole render
      // (and, during `next build`, failing the deployment).
      watchQuery: { errorPolicy: "all" },
      query: { errorPolicy: "all" },
    },
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
