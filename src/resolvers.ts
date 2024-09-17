import { User } from "@prisma/client";
import { CustomError } from "./error.js";
import { prisma } from "./prisma.js";
import { ContextAuthentication, UserInfo } from "./server.js";
import { checkEmailUnique, checkPasswordValid } from "./utils/validators.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean | null;
}

const authenticationCheck = (user: UserInfo) => {
  if (!user) {
    throw new CustomError(
      "Acesso não permitido",
      401,
      "Sem autorização permitida",
    );
  }
};

export const resolvers = {
  Query: {
    hello: () => "Hello world!",
    user: async (
      _: unknown,
      args: { id: number },
      context: ContextAuthentication,
    ) => {
      authenticationCheck(context.user);
      const userDb: User = await prisma.user.findUnique({
        where: { id: args.id },
      });
      if (!userDb) {
        throw new CustomError(
          "Id inválido",
          400,
          "O id não consta no banco de dados",
        );
      }
      return userDb;
    },
    users: async (
      _: unknown,
      args: { quantity: number },
      context: ContextAuthentication,
    ) => {
      const user = context.user;
      if (!user) {
        throw new CustomError(
          "Acesso não permitido",
          401,
          "Sem autorização permitida",
        );
      }
      const usersReturn = args.quantity ?? 10;
      const users = await prisma.user.findMany({
        take: usersReturn,
        orderBy: {
          name: "asc",
        },
      });
      return users;
    },
  },
  Mutation: {
    createUser: async (
      _: unknown,
      args: { data: UserInput },
      context: ContextAuthentication,
    ) => {
      authenticationCheck(context.user);
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
    },
    login: async (_: unknown, args: { data: LoginInput }) => {
      const login: LoginInput = args.data;
      const user = await prisma.user.findUnique({
        where: {
          email: login.email,
        },
      });
      if (
        user != null &&
        (await bcrypt.compare(login.password, user.password))
      ) {
        const timeExpiretion = login.rememberMe
          ? process.env.TIME_EXPIRATION_REMEBER_ME
          : process.env.TIME_EXPIRATION_DEFAULT;
        const token = jwt.sign({ userId: user.id }, process.env.TOKEN_JWT, {
          expiresIn: timeExpiretion,
        });

        return {
          token: token,
          user: user,
        };
      }
      throw new CustomError(
        "Email e/ou senha inválidos",
        400,
        "Email e/ou senha inseridos estã0 inválido. Por favor, tente novamente",
      );
    },
  },
};
