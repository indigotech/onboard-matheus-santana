import axios from "axios";
import { compare } from "bcrypt";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { prisma } from "../src/prisma.js";
import { UserInput } from "../src/types.js";
import jwt, { Secret } from "jsonwebtoken";
import { User } from "@prisma/client";

describe("CreateUser-mutation-test", () => {
  const buildUserInput = (email: string, password: string) => {
    return {
      birthDate: "07-12-2003",
      email: email,
      name: "Matheus",
      password: password,
      addresses: [
        {
          cep: "13455-200",
          city: "São Paulo",
          complement: "lado cidade s'ao paulo",
          neighborhood: "Bela vista",
          state: "SP",
          street: "Av. Paulista",
          streetNumber: 102,
        },
        {
          cep: "11239-400",
          city: "Rio de janeior",
          complement: "",
          neighborhood: "Vila penteado",
          state: "RJ",
          street: "Av. Teste",
          streetNumber: 105,
        },
      ],
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
          addresses {
            cep
            city
            complement
            neighborhood
            state
            street
            streetNumber
          }
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

  let userDb: User;

  beforeEach(async () => {
    const userTmp = buildUserInput(
      "matheus.12345@taqtile.com.br",
      "Teste12345",
    );
    userDb = await prisma.user.create({
      data: {
        name: userTmp.name,
        email: userTmp.email,
        password: userTmp.password,
        birthDate: userTmp.birthDate,
        addresses: {
          create: userTmp.addresses,
        },
      },
      include: { addresses: true },
    });
  });

  it("Should create a user in data base and return that info", async () => {
    const user = buildUserInput("matheus.54321@hotmail.com", "Teste1235571");
    const token = jwt.sign(
      { userId: userDb.id },
      process.env.TOKEN_JWT as Secret,
    );
    const response = await axios.post(endpoint, buildCreateUserMutation(user), {
      headers: { Authorization: token },
    });
    expect(response.data.data.createUser.birthDate).to.be.eq(user.birthDate);
    expect(response.data.data.createUser.email).to.be.eq(user.email);
    expect(response.data.data.createUser.name).to.be.eq(user.name);
    expect(
      await compare(user.password, response.data.data.createUser.password),
    ).to.be.eq(true);
    expect(response.data.data.createUser.addresses).to.be.deep.eq(
      user.addresses,
    );
  });

  it("Should return a error password invalid", async () => {
    const user = buildUserInput("teste.12345@gmail.com", "tes");
    const token = jwt.sign(
      { userId: userDb.id },
      process.env.TOKEN_JWT as Secret,
    );
    const response = await axios.post(endpoint, buildCreateUserMutation(user), {
      headers: { Authorization: token },
    });
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
    const token = jwt.sign(
      { userId: userDb.id },
      process.env.TOKEN_JWT as Secret,
    );
    const response = await axios.post(endpoint, buildCreateUserMutation(user), {
      headers: { Authorization: token },
    });

    expect(response.data.errors[0]).to.be.deep.eq(errorMessage);
  });
  it("Should return a error unauthorized", async () => {
    const user = buildUserInput("matheus.12345@taqtile.com.br", "12345Test");
    const errorMessage = buildErrorMessage(
      "Acesso não permitido",
      401,
      "Sem autorização permitida",
    );
    const response = await axios.post(endpoint, buildCreateUserMutation(user));

    expect(response.data.errors[0]).to.be.deep.eq(errorMessage);
  });

  afterEach(async () => {
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
  });
});
