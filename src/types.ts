export const typeDefs = `#graphql
  type Query {
    hello: String
    user(id: Int!): User
    users(limit: Int = 10, offset: Int = 0): UserList
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

  type UserList {
    users: [User]!
    previousPage: Int
    nextPage: Int
    totalUsers: Int!
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
