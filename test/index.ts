import { startServer } from "../src/server.js";
import { ApolloServer, BaseContext } from "@apollo/server";

export const endpoint = "http://localhost:4000/";

let serverApollo: ApolloServer<BaseContext>;

before(async () => {
  serverApollo = await startServer();
});

import "./hello-graphql-test.js";
import "./createUser-test.js";
import "./login-mutation-test.js";

after(async () => {
  await serverApollo.stop();
});
