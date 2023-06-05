import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";

import { tarkov_dev_uri } from "../uri";

// registerApolloClient will return a getClient function that,
// allows you to safely get an instance of the Apollo Client that’s scoped to the current request
// so you won’t end up sharing the Apollo Client cache within multiple requests
export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: tarkov_dev_uri,
    }),
  });
});
