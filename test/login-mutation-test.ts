import axios from "axios";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { LoginInput } from "../src/types.js";
import { prisma } from "../src/prisma.js";
import { User } from "@prisma/client";
import { genSalt, hash } from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { UserInfo } from "../src/server.js";

describe("Login-mutation-test", () => {
  const userInput = {
    name: "Matheus Gonçalves",
    email: "matheus.12345@taqtile.com",
    password: "Matheus12345",
    birthDate: "07-12-2003",
  };

  const buildLoginMutationInput = (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => {
    const loginInput: LoginInput = {
      email,
      password,
      rememberMe,
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

  let userResponse: User;

  beforeEach(async () => {
    const generatedSalt = await genSalt(1);
    const hashedPassword = await hash(userInput.password, generatedSalt);
    userInput.password = hashedPassword;
    userResponse = await prisma.user.create({
      data: userInput,
    });
  });

  it("Should return a user information and token with duration 1 day", async () => {
    userInput.password = "Matheus12345";
    const response = await axios.post(
      endpoint,
      buildLoginMutationInput(userInput.email, userInput.password),
    );
    const token = response.data.data.login.token;
    const loginResponseExpected = {
      user: userResponse,
      token,
    };
    const tokenDecoded = jwt.verify(
      response.data.data.login.token,
      process.env.TOKEN_JWT as Secret,
    ) as UserInfo;
    const tokenDuration = tokenDecoded.exp - tokenDecoded.iat;

    expect(response.data.data.login).to.be.deep.eq(loginResponseExpected);
    expect(tokenDuration).to.be.eq(24 * 60 * 60);
  });
  it("Should return a user information and token with duration 7 day", async () => {
    userInput.password = "Matheus12345";
    const response = await axios.post(
      endpoint,
      buildLoginMutationInput(userInput.email, userInput.password, true),
    );
    const token = response.data.data.login.token;
    const loginResponseExpected = {
      user: userResponse,
      token,
    };
    const tokenDecoded = jwt.verify(
      response.data.data.login.token,
      process.env.TOKEN_JWT as Secret,
    ) as UserInfo;
    const tokenDuration = tokenDecoded.exp - tokenDecoded.iat;
    expect(response.data.data.login).to.be.deep.eq(loginResponseExpected);
    expect(tokenDuration).to.be.eq(7 * 24 * 60 * 60);
  });

  it("Should return a error of login (wrong Email)", async () => {
    const wrongEmail = "teste.email.errado@taqtile.com";
    const response = await axios.post(
      endpoint,
      buildLoginMutationInput(wrongEmail, userInput.password, false),
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
      buildLoginMutationInput(userInput.email, wrongPassword),
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
