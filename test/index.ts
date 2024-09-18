import { ContextAuthentication, startServer } from "../src/server.js";
import { ApolloServer } from "@apollo/server";

export const endpoint = `http://localhost:${process.env.PORT}`;

let serverApollo: ApolloServer<ContextAuthentication>;

before(async () => {
  serverApollo = await startServer();
});

import "./hello-graphql-test.js";
import "./createUser-test.js";
import "./login-mutation-test.js";

after(async () => {
  await serverApollo.stop();
});
