import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const typeDefs = `#graphql
  type Query {
    hello: String
  }

  input UserInput{
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }

  type User{
    id: Int!
    name: String!
    email: String!
    password : String!
    birthDate: String!
  }

  type Mutation {
    createUser(data: UserInput!) : User
  }
  
`;

interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    createUser: async (_: unknown, args: { data: UserInput }) => {
      return prisma.user.create({
        data: { ...args.data },
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
