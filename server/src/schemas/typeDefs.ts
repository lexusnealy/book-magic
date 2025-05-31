const typeDefs = `
type User {
    _id: String
    username: String
    email: String
    password: String
    bookCount: Int
    savedBooks: [Book]!
}

type Book {
    bookId: String
    title: String
    authors: [String]
    description: String
    image: String
    link: String
}

type Auth {
    token: ID!
    user: User
}

input UserInput {
    username: String!
    email: String!
    password: String!
    savedBooks: [BookInput]
}

input BookInput {
  authors: [String]
  description: String
  bookId: String
  image: String
  link: String
  title: String
}

type Query {
    user(userId: ID!): User
    me: User
}

type Mutation {
    createUser(input: UserInput!): Auth
    loginUser(email: String!, password: String!): Auth
    saveBook(input: BookInput!): User
    deleteBook(bookId: ID!): User
}
`;

export default typeDefs;