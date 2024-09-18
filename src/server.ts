import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./types.js";
import { formatError } from "./erroFormat.js";
import jwt from "jsonwebtoken";

export interface ContextAuthentication {
  user: UserInfo;
}

export interface UserInfo {
  userId: number;
  iat: number;
  exp: number;
}

export async function startServer(): Promise<
  ApolloServer<ContextAuthentication>
> {
  const server = new ApolloServer<ContextAuthentication>({
    typeDefs,
    resolvers,
    formatError,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT) },
    context: async ({ req }) => {
      const token = req.headers.authorization ?? " ";
      try {
        const user = jwt.verify(token, process.env.TOKEN_JWT) as UserInfo;
        return { user };
      } catch {
        return null;
      }
    },
  });
  console.log(`🚀  Server ready at: ${url}`);
  return server;
}
