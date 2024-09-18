import axios from "axios";
import { endpoint } from ".";
import { prisma } from "../src/prisma";
import jwt, { Secret } from "jsonwebtoken";
import { expect } from "chai";
import { seedDatabase } from "../seed/seed-database";
import seedJson from "../seed/user-seed.json";
import { UserInput } from "../src/resolvers";

const generateUsers = (offset: number, limit: number) => {
  const seedUsers: UserInput[] = [];
  limit = Math.min(limit, seedJson.length);
  for (let i = offset; i < offset + limit; i++) {
    seedUsers.push(seedJson[i]);
  }
  return seedUsers;
};

describe("GetUsers-query-pagination-test", () => {
  const buildQueryUsers = (offset: number, limit: number) => {
    return {
      query: `query User( $limit: Int, $offset: Int) {
            users( limit: $limit, offset: $offset) {
                nextPage
                previousPage
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
    await seedDatabase();
  });

  it("Should return users information between the offset and limit", async () => {
    const token = jwt.sign({ userId: 10 }, process.env.TOKEN_JWT as Secret);
    const offset = 20;
    const limit = 10;
    const seedUsers = generateUsers(offset, limit);
    const response = await axios.post(
      endpoint,
      buildQueryUsers(offset, limit),
      {
        headers: { Authorization: token },
      },
    );
    expect(response.data.data.users).to.be.deep.eq({
      nextPage: 30,
      previousPage: 10,
      totalUsers: 50,
      users: seedUsers,
    });
  });

  it("Should return all users information in database", async () => {
    const token = jwt.sign({ userId: 10 }, process.env.TOKEN_JWT as Secret);
    const offset = 0;
    const limit = 1000;
    const seedUsers = generateUsers(offset, limit);
    const response = await axios.post(
      endpoint,
      buildQueryUsers(offset, limit),
      {
        headers: { Authorization: token },
      },
    );
    expect(response.data.data.users).to.be.deep.eq({
      nextPage: null,
      previousPage: null,
      totalUsers: 50,
      users: seedUsers,
    });
  });

  it("Should return a empty array in users and previous page equal 0", async () => {
    const token = jwt.sign({ userId: 10 }, process.env.TOKEN_JWT as Secret);
    const offset = 10000;
    const limit = 1000;
    const response = await axios.post(
      endpoint,
      buildQueryUsers(offset, limit),
      {
        headers: { Authorization: token },
      },
    );
    expect(response.data.data.users).to.be.deep.eq({
      nextPage: null,
      previousPage: 0,
      totalUsers: 50,
      users: [],
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });
});
