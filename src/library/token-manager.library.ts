import jwt, { JwtPayload } from 'jsonwebtoken';

export interface JWTSignInIOptions {
  expiresIn: string;
}

export class TokenManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static generateToken = (payload: any, secret: string, options?: JWTSignInIOptions): string => {
    return jwt.sign(payload, secret, options);
  };

  static verifyToken = (token: string, secret: string): string | JwtPayload => {
    return jwt.verify(token, secret);
  };
}
