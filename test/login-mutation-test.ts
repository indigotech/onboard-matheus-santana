import axios from "axios";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { LoginInput } from "../src/resolvers.js";

describe("Login-mutation-test", () => {
  const user: LoginInput = {
    email: "matheus.12345@taqtile.com",
    password: "Taqtile12345",
  };
  const graphqlQueryMutation = {
    query: `mutation Login($data: LoginInput!) {
        login(data: $data) {
            token
            user {
                email
                birthDate
                id
                password
                name
            }
        }
    }`,
    variables: {
      data: user,
    },
  };
  it("Should return a user informations and token", async () => {
    const response = await axios.post(endpoint, graphqlQueryMutation);
    expect(response.data.data.login.token).to.be.eq("adasafdsfsfdsfewwefwef");
    expect(response.data.data.login.user.name).to.be.eq("Matheus");
    expect(response.data.data.login.user.email).to.be.eq(
      "matheus.12345@taqtile.com",
    );
    expect(response.data.data.login.user.password).to.be.eq("Taqtile12345");
    expect(response.data.data.login.user.birthDate).to.be.eq("07/12/2003");
    expect(response.data.data.login.user.id).to.be.eq(15);
  });
});
