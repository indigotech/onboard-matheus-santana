import { hash } from "bcrypt";
import { prisma } from "../src/prisma";
import seedJson from "./user-seed.json";

export const seedDatabase = async () => {
  for (let i = 0; i < seedJson.length; i++) {
    seedJson[i].password = await hash(seedJson[i].password, 1);
  }
  await prisma.user.createMany({ data: seedJson });
};
