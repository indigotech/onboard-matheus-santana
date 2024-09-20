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
    addresses: [AddressesInput!]!
  }

  type User{
    id: Int!
    name: String!
    email: String!
    password : String!
    birthDate: String!
    addresses: [Addresses]!
  }
  
  type Addresses {
    id: Int!     
    cep: String!
    street: String!
    streetNumber: Int!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
    userId: Int!
  }

  input AddressesInput {    
    cep: String!
    street: String!
    streetNumber: Int!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
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
export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  addresses: AddressInput[];
}

export interface AddressInput {
  cep: string;
  street: string;
  streetNumber: number;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean | null;
}
