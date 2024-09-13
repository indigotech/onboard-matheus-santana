import { expect } from "chai";
import axios from "axios";
import { startServer } from "../src/server.js";
import { ApolloServer, BaseContext } from "@apollo/server";
import { UserInput } from "../src/resolvers.js";
import { compare } from "bcrypt";
import { prisma } from "../src/prisma.js";

const endpoint = "http://localhost:4000/";

let serverApollo: ApolloServer<BaseContext>;

before(async () => {
  serverApollo = await startServer();
});

describe("Hello-world-teste", () => {
  it("Should return Hello World!, its working", () => {
    console.log("Hello World!, its working");
  });
});

describe("Hello-world-graphql", () => {
  const graphqlQuery = {
    query: `query fetchHelloWord {
    hello
  }`,
  };
  it("Should return Hello world!", async () => {
    const response = await axios.post(endpoint, graphqlQuery);
    expect(response.data.data.hello).to.be.eq("Hello world!");
  });
});

describe("CreateUser-mutation-test", () => {
  const user: UserInput = {
    birthDate: "07-12-2003",
    email: "matheus.12345@hotmail.com",
    name: "Matheus",
    password: "Teste1235571",
  };
  const graphqlQueryMutation = {
    query: `mutation Mutation($data: UserInput!) {
      createUser(data: $data) {
        birthDate
        email
        id
        name
        password
      }
    }`,
    variables: {
      data: user,
    },
  };
  it("Should create a user in data base and return that info", async () => {
    const response = await axios.post(endpoint, graphqlQueryMutation);
    expect(response.data.data.createUser.birthDate).to.be.eq(user.birthDate);
    expect(response.data.data.createUser.email).to.be.eq(user.email);
    expect(response.data.data.createUser.name).to.be.eq(user.name);
    expect(
      await compare(user.password, response.data.data.createUser.password),
    ).to.be.eq(true);
  });
  after(async () => {
    await prisma.user.delete({
      where: {
        email: user.email,
      },
    });
  });
});

after(async () => {
  await serverApollo.stop();
});
