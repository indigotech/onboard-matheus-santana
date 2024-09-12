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
      const mockedLogin = {
        user: {
          id: 15,
          name: "Matheus",
          email: "matheus.12345@taqtile.com",
          password: "Taqtile12345",
          birthDate: "07/12/2003",
        },
        token: "adasafdsfsfdsfewwefwef",
      };
      const login: LoginInput = args.data;
      if (
        mockedLogin.user.email === login.email &&
        mockedLogin.user.password === mockedLogin.user.password
      ) {
        return mockedLogin;
      }
      throw new CustomError(
        "Email e/ou senha inválidos",
        400,
        "Email e/ou senha inseridos estã0 inválido. Por favor, tente novamente",
      );
    },
  },
};
