import axios from "axios";
import { expect } from "chai";
import { endpoint } from "./index.js";
import { UserInput } from "../src/resolvers.js";

describe("CreateUser-mutation-test", () => {
  const user: UserInput = {
    birthDate: "07-12-2003",
    email: "matheus.12345@hotmail.com",
    name: "Matheus",
    password: "tes",
  };
  const graphqlQueryMutation = {
    query: `mutation Mutation($data: UserInput!) {
        createUser(data: $data) {
          birthDate
          email
          id
          name
          password
        }
      }`,
    variables: {
      data: user,
    },
  };
  it("Should create a user in data base and return that info", async () => {
    const response = await axios.post(endpoint, graphqlQueryMutation);
    expect(response.data.errors[0].message).to.be.eq("Senha invalida");
    expect(response.data.errors[0].code).to.be.eq(400);
    expect(response.data.errors[0].additionalInfo).to.be.eq(
      "A senha deve conter no mínimo 1 letra maiúscula, 1 letra minúscula, 1 numéro e 6 caracteres de tamanho",
    );
  });
});
