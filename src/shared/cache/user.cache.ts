import { IUserDocument } from '@features/user/interfaces/user.interface';
import { ServerError } from '@library/error-handler.library';
import { Logger } from '@library/logger.library';
import { BaseCache } from '@shared/cache/base.cache';
import { parseJson } from '@utils/strings.utils';

const log = Logger.create('user-cache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();

    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'createdAt',
      `${createdAt}`,
      'postsCount',
      `${postsCount}`
    ];

    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];

    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`
    ];

    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;

      response.createdAt = new Date(parseJson(`${response.createdAt}`));
      response.postsCount = parseJson(`${response.postsCount}`);
      response.blocked = parseJson(`${response.blocked}`);
      response.blockedBy = parseJson(`${response.blockedBy}`);
      response.notifications = parseJson(`${response.notifications}`);
      response.social = parseJson(`${response.social}`);
      response.followersCount = parseJson(`${response.followersCount}`);
      response.followingCount = parseJson(`${response.followingCount}`);
      response.bgImageId = parseJson(`${response.bgImageId}`);
      response.bgImageVersion = parseJson(`${response.bgImageVersion}`);
      response.profilePicture = parseJson(`${response.profilePicture}`);
      response.work = parseJson(`${response.work}`);
      response.school = parseJson(`${response.school}`);
      response.location = parseJson(`${response.location}`);
      response.quote = parseJson(`${response.quote}`);

      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
