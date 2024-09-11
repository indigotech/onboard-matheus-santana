export const typeDefs = `#graphql
  type Query {
    hello: String
  }

  input UserInput{
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }

  type User{
    id: Int!
    name: String!
    email: String!
    password : String!
    birthDate: String!
  }

  type Mutation {
    createUser(data: UserInput!) : User
  }
  
`;