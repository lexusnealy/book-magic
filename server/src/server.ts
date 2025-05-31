import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import db from './config/connection.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateGraphQL, type GraphQLContext } from './services/auth.js';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Apply middleware before routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create Apollo Server
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  formatError: (error) => {
    // Log the error for debugging
    console.error('GraphQL Error:', error);
    return error;
  },
});

// Start Apollo Server
await server.start();

// Create context function with explicit typing
const createContext = async (contextParams: { req: express.Request }): Promise<GraphQLContext> => {
  try {
    const context: GraphQLContext = { request: contextParams.req };
    return authenticateGraphQL(context);
  } catch (error) {
    console.error('Context creation error:', error);
    throw error;
  }
};

// Apply Apollo middleware with CORS enabled
app.use('/graphql', expressMiddleware(server, { context: createContext }));

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message });
});

// Connect to MongoDB and start server
db.once('open', () => {
  console.log('📦 Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on port ${PORT}`);
    console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🔑 JWT Secret Key: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
    console.log(`📦 MongoDB URI: ${process.env.MONGO_URI ? 'Set' : 'Not set'}`);
  });
});