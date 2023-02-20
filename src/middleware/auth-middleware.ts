import { AuthPayload } from '@features/auth/interfaces/auth.interfaces';
import { NotAuthorizedError } from '@library/error-handler.library';
import { TokenManager } from '@library/token-manager.library';
import { config } from '@root/config';
import { NextFunction, Request, Response } from 'express';

export class AuthMiddleware {
  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    const currentUser = req.currentUser;
    if (!currentUser) throw new NotAuthorizedError('Access denied. Authentication is required.');

    next();
  }

  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    const accessToken = req?.session?.accessToken;

    if (!accessToken) throw new NotAuthorizedError('Access denied. No token provided.');

    try {
      const payload = TokenManager.verifyToken(accessToken, config.ACCESS_TOKEN_SECRET!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid. Please login again.');
    }

    next();
  }
}

export const authMiddleware = new AuthMiddleware();
