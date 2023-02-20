import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class SignOutController {
  public async signOut(req: Request, res: Response): Promise<void> {
    req.session = null;

    const response = { message: 'Logout successful', user: {}, accessToken: '' };
    res.status(HTTP_STATUS.OK).json(response);
  }
}
