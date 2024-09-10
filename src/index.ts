import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import { checkEmailUnique, checkPasswordValid } from "./utils/validators.js";
import * as bcrypt from "bcrypt";

export const prisma = new PrismaClient();

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
      try {
        const { name, email, birthDate, password }: UserInput = args.data;
        const generatedSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          checkPasswordValid(password),
          generatedSalt,
        );
        return prisma.user.create({
          data: {
            name: name,
            email: await checkEmailUnique(email),
            birthDate: birthDate,
            password: hashedPassword,
          },
        });
      } catch (err) {
        return err;
      }
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
