// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        name?: string;
      } | JwtPayload | string | object;
    }
  }
}

export {};