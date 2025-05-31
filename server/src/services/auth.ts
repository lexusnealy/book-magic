import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import type { BaseContext } from '@apollo/server';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

export interface GraphQLContext extends BaseContext {
  user?: JwtPayload;
  request?: Request;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const secretKey = process.env.JWT_SECRET || '';

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      req.user = user as JwtPayload;
      return next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

export const authenticateGraphQL = async (context: GraphQLContext) => {
  const authHeader = context.request?.headers.authorization;

  if (!authHeader) {
    // Return context without authentication for non-protected routes
    return context;
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET || '';

  try {
    const user = jwt.verify(token, secretKey) as JwtPayload;
    context.user = user;
    return context;
  } catch (err) {
    throw new GraphQLError('Invalid token', {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};