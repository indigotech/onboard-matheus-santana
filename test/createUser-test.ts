import axios from "axios";
import { compare } from "bcrypt";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { prisma } from "../src/prisma.js";
import { UserInput } from "../src/resolvers.js";

describe("CreateUser-mutation-test", () => {
  const buildUserInput = (email: string, password: string): UserInput => {
    return {
      birthDate: "07-12-2003",
      email: email,
      name: "Matheus",
      password: password,
    };
  };

  const buildCreateUserMutation = (user: UserInput) => {
    return {
      query: `mutation Mutation($data: UserInput!) {
          createUser(data: $data) {
            birthDate
            email
            name
            password
          }
        }`,
      variables: {
        data: user,
      },
    };
  };

  const buildErrorMessage = (
    message: string,
    code: number,
    additionalInfo: string,
  ) => {
    return {
      message: message,
      code: code,
      additionalInfo: additionalInfo,
    };
  };

  beforeEach(async () => {
    await prisma.user.create({
      data: buildUserInput("matheus.12345@taqtile.com.br", "Teste12345"),
    });
  });

  it("Should create a user in data base and return that info", async () => {
    const user = buildUserInput("matheus.54321@hotmail.com", "Teste1235571");
    const response = await axios.post(endpoint, buildCreateUserMutation(user));
    expect(response.data.data.createUser.birthDate).to.be.eq(user.birthDate);
    expect(response.data.data.createUser.email).to.be.eq(user.email);
    expect(response.data.data.createUser.name).to.be.eq(user.name);
    expect(
      await compare(user.password, response.data.data.createUser.password),
    ).to.be.eq(true);
  });

  it("Should create a user in data base and return that info", async () => {
    const user = buildUserInput("teste.12345@gmail.com", "tes");
    const response = await axios.post(endpoint, buildCreateUserMutation(user));
    const errorMessage = buildErrorMessage(
      "Senha invalida",
      400,
      "A senha deve conter no mínimo 1 letra maiúscula, 1 letra minúscula, 1 numéro e 6 caracteres de tamanho",
    );

    expect(response.data.errors[0]).to.be.deep.eq(errorMessage);
  });

  it("Should return a error email already exist", async () => {
    const user = buildUserInput("matheus.12345@taqtile.com.br", "12345Test");
    const errorMessage = buildErrorMessage(
      "O email já existe",
      400,
      "O email na qual está tentando ser cadastrado já existe na base de dados",
    );

    const response = await axios.post(endpoint, buildCreateUserMutation(user));

    expect(response.data.errors[0]).to.be.deep.eq(errorMessage);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });
});