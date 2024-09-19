export const typeDefs = `#graphql
  type Query {
    hello: String
    user(id: Int!): User
    users(quantity: Int = 10): [User]
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
    login(data: LoginInput!) : UserLogin
  }

  input LoginInput{
    email: String!
    password: String!
    rememberMe: Boolean
  }
  
  type UserLogin{
    user: User
    token: String!
  }
`;
