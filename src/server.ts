import { ApolloServer, BaseContext } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./types.js";
import { formatError } from "./erroFormat.js";

export interface UserInfo {
  userId: number;
  iat: number;
  exp: number;
}

export async function startServer(): Promise<ApolloServer<BaseContext>> {
  const server = new ApolloServer<BaseContext>({
    typeDefs,
    resolvers,
    formatError,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT) },
  });
  console.log(`🚀  Server ready at: ${url}`);
  return server;
}
