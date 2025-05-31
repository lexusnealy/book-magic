import type { User } from '../models/User.js';
import type { Book } from '../models/Book.js';

// GraphQL endpoint
const GRAPHQL_ENDPOINT = '/graphql';

// Helper function to make GraphQL requests
const graphqlRequest = async (query: string, variables = {}, token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

// Get logged in user's info
export const getMe = async (token: string) => {
  const query = `
    query Me {
      me {
        _id
        username
        email
        bookCount
        savedBooks {
          bookId
          authors
          description
          title
          image
          link
        }
      }
    }
  `;

  const response = await graphqlRequest(query, {}, token);
  return response.data.me;
};

// Create a new user
export const createUser = async (userData: User) => {
  const query = `
    mutation AddUser($username: String!, $email: String!, $password: String!) {
      addUser(username: $username, email: $email, password: $password) {
        token
        user {
          _id
          username
          email
        }
      }
    }
  `;

  const variables = {
    username: userData.username,
    email: userData.email,
    password: userData.password,
  };

  const response = await graphqlRequest(query, variables);
  return response.data.addUser;
};

// Login a user
export const loginUser = async (userData: User) => {
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          _id
          username
          email
        }
      }
    }
  `;

  const variables = {
    email: userData.email,
    password: userData.password,
  };

  const response = await graphqlRequest(query, variables);
  return response.data.login;
};

// Save a book to user's account
export const saveBook = async (bookData: Book, token: string) => {
  const query = `
    mutation SaveBook($bookData: BookInput!) {
      saveBook(bookData: $bookData) {
        _id
        savedBooks {
          bookId
          authors
          description
          title
          image
          link
        }
      }
    }
  `;

  const variables = {
    bookData,
  };

  const response = await graphqlRequest(query, variables, token);
  return response.data.saveBook;
};

// Delete a book from user's account
export const deleteBook = async (bookId: string, token: string) => {
  const query = `
    mutation RemoveBook($bookId: String!) {
      removeBook(bookId: $bookId) {
        _id
        savedBooks {
          bookId
          authors
          description
          title
          image
          link
        }
      }
    }
  `;

  const variables = {
    bookId,
  };

  const response = await graphqlRequest(query, variables, token);
  return response.data.removeBook;
};

// Search Google Books API
export const searchGoogleBooks = (query: string) => {
  return fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
};