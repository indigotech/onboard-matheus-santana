import { hash } from "bcrypt";
import { prisma } from "../src/prisma";
import seedJson from "./user-seed.json";

const seedDatabase = async () => {
  for (let i = 0; i < seedJson.length; i++) {
    seedJson[i].password = await hash(seedJson[i].password, 10);
  }
  await prisma.user.createMany({ data: seedJson });
};

console.log("populating a database...");

seedDatabase();
