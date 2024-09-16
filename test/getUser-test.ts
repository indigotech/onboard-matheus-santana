import axios from "axios";
import { endpoint } from ".";
import { prisma } from "../src/prisma";
import { UserInput } from "../src/resolvers";
import jwt, { Secret } from "jsonwebtoken";
import { User } from "@prisma/client";
import { expect } from "chai";

describe("GetUser-query-test", () => {
  const user: UserInput = {
    name: "Matheus Gonçalves",
    email: "matheus.12345@taqtile.com",
    password: "Matheus12345",
    birthDate: "07-12-2003",
  };

  const buildQueryUser = (id: number) => {
    return {
      query: `query User($userId: Int!) {
      user(id: $userId) {
        birthDate
        id
        email
        name
        password
      }
    }`,
      variables: {
        userId: id,
      },
    };
  };

  let userDb: User;

  beforeEach(async () => {
    userDb = await prisma.user.create({
      data: user,
    });
  });

  it("Should return user information corresponding to the id", async () => {
    const token = jwt.sign(
      { userId: userDb.id },
      process.env.TOKEN_JWT as Secret,
    );

    const response = await axios.post(endpoint, buildQueryUser(userDb.id), {
      headers: { Authorization: token },
    });
    expect(response.data.data.user).to.be.deep.eq(userDb);
  });
  it("Should return error id invalid", async () => {
    const token = jwt.sign(
      { userId: userDb.id },
      process.env.TOKEN_JWT as Secret,
    );

    userDb.id = -1;

    const response = await axios.post(endpoint, buildQueryUser(userDb.id), {
      headers: { Authorization: token },
    });
    const getUserErrorResponseExpected = {
      message: "Id inválido",
      code: 400,
      additionalInfo: "O id não consta no banco de dados",
    };
    expect(response.data.errors[0]).to.be.deep.eq(getUserErrorResponseExpected);
  });

  afterEach(async () => {
    await prisma.user.delete({
      where: {
        email: user.email,
      },
    });
  });
});
