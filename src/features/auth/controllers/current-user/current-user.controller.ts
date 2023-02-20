import { UserCache } from '@shared/cache/user.cache';
import { userService } from '@shared/services/db/user.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

export class CurrentUserController {
  public async currentUser(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let accessToken = null;
    let user = null;

    const currentUserId = req?.currentUser?.userId.toString() || '';
    const cachedUser = await userCache.getUserFromCache(currentUserId);

    const authUser = cachedUser || (await userService.getUserById(currentUserId));

    if (Object.keys(authUser).length) {
      isUser = true;
      accessToken = req.session?.accessToken;
      user = authUser;
    }

    const response = { accessToken, isUser, user };
    res.status(HTTP_STATUS.OK).json(response);
  }
}
