import { JWTPayload } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// This export makes TypeScript treat this as a module
export {};