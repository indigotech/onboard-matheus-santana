import { prisma } from "./prisma.js";
import { checkEmailUnique, checkPasswordValid } from "./utils/validators.js";
import * as bcrypt from "bcrypt";

interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    createUser: async (_: unknown, args: { data: UserInput }) => {
      try {
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
      } catch (err) {
        return err;
      }
    },
  },
};
