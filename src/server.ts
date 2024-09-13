import { ApolloServer, BaseContext } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./types.js";
import { formatError } from "./erroFormat.js";

export async function startServer(): Promise<ApolloServer<BaseContext>> {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`🚀  Server ready at: ${url}`);
  return server;
}
