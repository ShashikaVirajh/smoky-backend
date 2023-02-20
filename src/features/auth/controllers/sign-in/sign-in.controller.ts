import { authService } from '@features/auth/auth.service';
import { signInSchema } from '@features/auth/auth.validations';
import { IUserDocument } from '@features/user/interfaces/user.interface';
import { BadRequestError } from '@library/error-handler.library';
import { TokenManager } from '@library/token-manager.library';
import { joiValidation } from '@library/validation.library';
import { config } from '@root/config';
import { userService } from '@shared/services/db/user.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class SignInController {
  @joiValidation(signInSchema)
  public async signIn(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const authUser = await authService.getAuthUserByUsername(username);
    if (!authUser) throw new BadRequestError('Invalid credentials');

    const passwordsMatch = await authUser.comparePassword(password);
    if (!passwordsMatch) throw new BadRequestError('Invalid credentials');

    const user = await userService.getUserByAuthId(authUser?._id.toString());

    const tokenPayload = {
      userId: user._id,
      uId: authUser.uId,
      email: authUser.email,
      username: authUser.username,
      avatarColor: authUser.avatarColor
    };

    const accessToken = TokenManager.generateToken(tokenPayload, config.ACCESS_TOKEN_SECRET!);

    const userDocument: IUserDocument = {
      ...user,
      authId: authUser!._id,
      username: authUser!.username,
      email: authUser!.email,
      avatarColor: authUser!.avatarColor,
      uId: authUser!.uId,
      createdAt: authUser!.createdAt
    } as IUserDocument;

    req.session = { accessToken };

    const response = { message: 'User logged in successfully', user: userDocument, accessToken };
    res.status(HTTP_STATUS.OK).json(response);
  }
}
