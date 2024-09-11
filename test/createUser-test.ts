import axios from "axios";
import { compare } from "bcrypt";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { prisma } from "../src/prisma.js";
import { UserInput } from "../src/resolvers.js";

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
