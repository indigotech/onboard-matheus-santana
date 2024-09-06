import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
  type Query {
    hello: String
  }

  input UserInput{
    name: String
    email: String
    password: String
    birthDate: String
  }

  type User{
    id: Int
    name: String
    email: String
    password : String
    birthDate: String
  }

  type Mutation {
    createUser(data: UserInput) : User
  }
  
`;

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

const users: User[] = [];
let idIncrement: number = 0;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    createUser: (_: unknown, args: { data: UserInput }): User => {
      const id = ++idIncrement;

      const user = { ...args.data, id: id };

      users.push(user);
      return user;
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
