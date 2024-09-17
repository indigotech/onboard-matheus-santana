import axios from "axios";
import { endpoint } from ".";
import { prisma } from "../src/prisma";
import jwt, { Secret } from "jsonwebtoken";
import { expect } from "chai";
import { seedDatabase } from "../seed/seed-database";
import seedJson from "../seed/user-seed.json";
import { UserInput } from "../src/resolvers";

let seedUsers: UserInput[] = [];

const generateUsers = (offset: number, limit: number) => {
  limit = limit > seedJson.length ? seedJson.length : limit;
  for (let i = offset; i < offset + limit; i++) {
    seedUsers.push(seedJson[i]);
  }
};

describe("GetUsers-query-pagination-test", () => {
  const buildQueryUsers = (offset: number, limit: number) => {
    return {
      query: `query User( $limit: Int, $offset: Int) {
            users( limit: $limit, offset: $offset) {
                nextPage
                previusPage
                totalUsers
                users {
                    name
                    password
                    email
                    birthDate
                }
            }
        }`,
      variables: {
        offset: offset,
        limit: limit,
      },
    };
  };

  beforeEach(async function () {
    this.timeout(0);
    await seedDatabase();
  });

  it("Should return users informations between the offset and limit", async () => {
    const token = jwt.sign({ userId: 10 }, process.env.TOKEN_JWT as Secret);
    const offset = 20;
    const limit = 10;
    generateUsers(offset, limit);
    const response = await axios.post(
      endpoint,
      buildQueryUsers(offset, limit),
      {
        headers: { Authorization: token },
      },
    );
    expect(response.data.data.users).to.be.deep.eq({
      nextPage: 30,
      previusPage: 10,
      totalUsers: 50,
      users: seedUsers,
    });
  });

  it("Should return all users informations in database", async () => {
    const token = jwt.sign({ userId: 10 }, process.env.TOKEN_JWT as Secret);
    const offset = 0;
    const limit = 1000;
    generateUsers(offset, limit);
    const response = await axios.post(
      endpoint,
      buildQueryUsers(offset, limit),
      {
        headers: { Authorization: token },
      },
    );
    expect(response.data.data.users).to.be.deep.eq({
      nextPage: null,
      previusPage: null,
      totalUsers: 50,
      users: seedUsers,
    });
  });

  afterEach(async () => {
    seedUsers = [];
    await prisma.user.deleteMany();
  });
});
