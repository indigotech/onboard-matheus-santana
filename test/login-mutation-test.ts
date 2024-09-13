import axios from "axios";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { LoginInput, UserInput } from "../src/resolvers.js";
import { prisma } from "../src/prisma.js";
import { User } from "@prisma/client";

describe("Login-mutation-test", () => {
  const userInput: UserInput = {
    name: "Matheus Gonçalves",
    email: "matheus.12345@taqtile.com",
    password: "Matheus12345",
    birthDate: "07-12-2003",
  };

  const graphqlMutatitonGenereted = (email: string, password: string) => {
    const loginInput: LoginInput = {
      email: email,
      password: password,
    };

    const graphqlMutationLogin = {
      query: `mutation Login($data: LoginInput!) {
    login(data: $data) {
      user {
        birthDate
        email
        id
        name
        password
      }
      token
      }
    }`,
      variables: {
        data: loginInput,
      },
    };

    return graphqlMutationLogin;
  };

  const graphqlMutationCreateUser = {
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
      data: userInput,
    },
  };

  let userResponse: User;

  beforeEach(async () => {
    userResponse = (await axios.post(endpoint, graphqlMutationCreateUser)).data
      .data.createUser;
  });

  it("Should return a user information and token", async () => {
    const response = await axios.post(
      endpoint,
      graphqlMutatitonGenereted(userInput.email, userInput.password),
    );

    const loginResponseExpected = {
      user: userResponse,
      token: " ",
    };

    expect(response.data.data.login).to.be.deep.eq(loginResponseExpected);
  });

  it("Should return a error of login (wrong Email)", async () => {
    const wrongEmail = "teste.email.errado@taqtile.com";
    const response = await axios.post(
      endpoint,
      graphqlMutatitonGenereted(wrongEmail, userInput.password),
    );

    const loginResponseExpected = {
      message: "Email e/ou senha inválidos",
      code: 400,
      additionalInfo:
        "Email e/ou senha inseridos estã0 inválido. Por favor, tente novamente",
    };

    expect(response.data.errors[0]).to.be.deep.eq(loginResponseExpected);
  });

  it("Should return a error of login (Wrong password)", async () => {
    const wrongPassword = "1234";
    const response = await axios.post(
      endpoint,
      graphqlMutatitonGenereted(userInput.email, wrongPassword),
    );

    const loginResponseExpected = {
      message: "Email e/ou senha inválidos",
      code: 400,
      additionalInfo:
        "Email e/ou senha inseridos estã0 inválido. Por favor, tente novamente",
    };

    expect(response.data.errors[0]).to.be.deep.eq(loginResponseExpected);
  });

  afterEach(async () => {
    await prisma.user.delete({
      where: {
        email: userInput.email,
      },
    });
  });
});
