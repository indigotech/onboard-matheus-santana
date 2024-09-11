import axios from "axios";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { UserInput } from "../src/resolvers.js";
import { prisma } from "../src/prisma.js";

describe("CreateUser-already-exist-test", () => {
  const user: UserInput = {
    birthDate: "07-12-2003",
    email: "matheus.12345@hotmail.com",
    name: "Matheus",
    password: "Teste1235571",
  };
  before(async () => {
    await prisma.user.create({
      data: user,
    });
  });
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
    expect(response.data.errors[0].message).to.be.eq("O email já existe");
    expect(response.data.errors[0].code).to.be.eq(400);
    expect(response.data.errors[0].additionalInfo).to.be.eq(
      "O email na qual está tentando ser cadastrado já existe na base de dados",
    );
  });
  after(async () => {
    await prisma.user.delete({
      where: {
        email: user.email,
      },
    });
  });
});
