import axios from "axios";
import { expect } from "chai";
import { endpoint } from "./index.js";

describe("Hello-world-graphql", () => {
  const graphqlQuery = {
    query: `query fetchHelloWord {
      hello
    }`,
  };
  it("Should return Hello world!", async () => {
    const response = await axios.post(endpoint, graphqlQuery);
    expect(response.data.data.hello).to.be.eq("Hello world!");
  });
});
