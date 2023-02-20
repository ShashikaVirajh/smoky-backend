import { AuthQueueJobs, UserQueueJobs } from '@enums';
import { ISignUpData } from '@features/auth/interfaces/auth.interfaces';
import { authService } from '@features/auth/service/auth.service';
import { signUpSchema } from '@features/auth/validations/auth.validations';
import { uploadImage } from '@library/cloudinary.library';
import { BadRequestError } from '@library/error-handler.library';
import { TokenManager } from '@library/token-manager.library';
import { joiValidation } from '@library/validation.library';
import { normalizeSignUpPayload, normalizeUserPayload } from '@normalizers/user.normalizer';
import { config } from '@root/config';
import { UserCache } from '@shared/cache/user.cache';
import { authQueue } from '@shared/queues/auth.queue';
import { userQueue } from '@shared/queues/user.queue';
import { generateRandomIntegers } from '@utils/numbers.utils';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { omit } from 'lodash';
import { ObjectId } from 'mongodb';

const userCache: UserCache = new UserCache();

export class SignUpController {
  @joiValidation(signUpSchema)
  public async signUp(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const user = await authService.getUserByUsernameOrEmail(username, email);

    if (user) throw new BadRequestError('Username or Email already exists');

    const authObjectId = new ObjectId();
    const userObjectId = new ObjectId();
    const uId = generateRandomIntegers(12);

    const signUpData: ISignUpData = {
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    };

    const authData = normalizeSignUpPayload(signUpData);

    const uploadResult = await uploadImage(avatarImage, userObjectId.toString(), true, true);
    if (!uploadResult?.public_id) throw new BadRequestError('File upload: Error occurred. Try again.');

    // Add to redis cache
    const userDataForCache = normalizeUserPayload(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/dgwpkvr9n/image/upload/v${uploadResult.version}/${userObjectId}`;
    await userCache.saveUserToCache(userObjectId.toString(), uId, userDataForCache);

    // Add to database
    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    authQueue.addAuthUserJob(AuthQueueJobs.ADD_AUTH_USER_TO_DB, { value: authData });
    userQueue.addUserJob(UserQueueJobs.ADD_USER_DETAILS_TO_DB, { value: userDataForCache });

    const tokenPayload = {
      userId: userObjectId,
      uId: authData.uId,
      email: authData.email,
      username: authData.username,
      avatarColor: authData.avatarColor
    };

    console.log({ tokenPayload });

    const accessToken = TokenManager.generateToken(tokenPayload, config.ACCESS_TOKEN_SECRET!);
    console.log({ accessToken });
    req.session = { accessToken };

    const response = { message: 'User created successfully', user: userDataForCache, accessToken };
    res.status(HTTP_STATUS.CREATED).json(response);
  }
}
