import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { BrowserRouter } from "react-router-dom";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const tarkov_dev_uri = "https://api.tarkov.dev/graphql";

const client = new ApolloClient({
  uri: tarkov_dev_uri,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
);
