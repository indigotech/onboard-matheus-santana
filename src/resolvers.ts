import { CustomError } from "./error.js";
import { prisma } from "./prisma.js";
import { checkEmailUnique, checkPasswordValid } from "./utils/validators.js";
import * as bcrypt from "bcrypt";

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    createUser: async (_: unknown, args: { data: UserInput }) => {
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
        return {
          token: " ",
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
