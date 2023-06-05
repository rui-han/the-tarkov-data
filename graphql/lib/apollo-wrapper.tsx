"use client";

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  SuspenseCache,
} from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";

import { tarkov_dev_uri } from "../uri";

function makeClient() {
  const httpLink = new HttpLink({
    uri: tarkov_dev_uri,
  });

  return new ApolloClient({
    /* 
      NextSSRInMemoryCache: 
      this cache knows how to store the normalised cache in a way 
      that can be then reused by the ApolloNextAppProvider 
      to restore the cache on the browser side
    */
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            // if this is executed in SSR we also combine it with the SSRMultipartLink
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  });
}

function makeSuspenseCache() {
  return new SuspenseCache();
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider
      makeClient={makeClient}
      makeSuspenseCache={makeSuspenseCache}
    >
      {children}
    </ApolloNextAppProvider>
  );
}
