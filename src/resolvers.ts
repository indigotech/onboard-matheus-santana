import { User } from "@prisma/client";
import { CustomError } from "./error.js";
import { prisma } from "./prisma.js";
import { ContextAuthentication, UserInfo } from "./server.js";
import { checkEmailUnique, checkPasswordValid } from "./utils/validators.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginInput, UserInput } from "./types.js";

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
        include: { addresses: true },
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
      args: { limit: number; offset: number },
      context: ContextAuthentication,
    ) => {
      authenticationCheck(context.user);
      const totalUsers = await prisma.user.count();
      const usersReturn = args.limit > totalUsers ? 50 : (args.limit ?? 10);
      const offset = args.offset ?? 0;
      const previousPage =
        offset - usersReturn > 0 ? offset - usersReturn : null;
      const nextPage =
        offset + usersReturn < totalUsers ? offset + usersReturn : null;

      const users = await prisma.user.findMany({
        skip: offset,
        take: usersReturn,
        orderBy: {
          name: "asc",
        },
        include: { addresses: true },
      });

      return {
        users: users,
        previousPage: previousPage >= totalUsers ? 0 : previousPage,
        nextPage: nextPage,
        totalUsers: totalUsers,
      };
    },
  },
  Mutation: {
    createUser: async (
      _: unknown,
      args: { data: UserInput },
      context: ContextAuthentication,
    ) => {
      authenticationCheck(context.user);

      const { name, email, password, birthDate, addresses }: UserInput =
        args.data;
      const generatedSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        checkPasswordValid(password),
        generatedSalt,
      );
      return await prisma.user.create({
        data: {
          name: name,
          email: await checkEmailUnique(email),
          birthDate: birthDate,
          password: hashedPassword,
          addresses: {
            create: addresses,
          },
        },
        include: { addresses: true },
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
