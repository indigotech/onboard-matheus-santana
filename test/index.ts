import { expect } from "chai";
import { before, describe, it } from "node:test";
import axios from "axios";
import { startServer } from "../src/server.js";

const endpoint = "http://localhost:4000/";

const graphqlQuery = {
  query: `query fetchHelloWord {
  hello
}`,
};

describe("Hello-world-teste", () => {
  it("Should return Hello World!, its working", () => {
    console.log("Hello World!, its working");
  });
});

describe("Hello-world-graphql", () => {
  before(async () => {
    await startServer();
  });
  it("Should return Hello world!", async () => {
    const response = await axios.post(endpoint, graphqlQuery);
    expect(response.data.data.hello).to.be.eq("Hello world!");
  });
});
