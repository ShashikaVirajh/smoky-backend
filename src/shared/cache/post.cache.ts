import { IPostDocument, ISavePostToCache } from '@features/post/post.interfaces';
import { IReactions } from '@features/reaction/reaction.interfaces';
import { ServerError } from '@library/error-handler.library';
import { Logger } from '@library/logger.library';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { BaseCache } from '@shared/cache/base.cache';
import { parseJson } from '@utils/strings.utils';

const log = Logger.create('post-cache');

export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      videoId,
      videoVersion,
      reactions,
      createdAt
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`
    ];

    const secondList: string[] = [
      'commentsCount',
      `${commentsCount}`,
      'reactions',
      JSON.stringify(reactions),
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'videoId',
      `${videoId}`,
      'videoVersion',
      `${videoVersion}`,
      'createdAt',
      `${createdAt}`
    ];

    const dataToSave = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');

      // await this.client.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      await this.client.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      await this.client.HSET(`posts:${key}`, dataToSave);

      const count = parseInt(postCount[0], 10) + 1;

      await this.client.HSET(`users:${currentUserId}`, ['postsCount', count]);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies = (await multi.exec()) as PostCacheMultiType[];

      const postReplies: IPostDocument[] = [];

      for (const post of replies as IPostDocument[]) {
        post.commentsCount = parseJson(post.commentsCount.toString());
        post.reactions = parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;

        postReplies.push(post);
      }

      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalPostsInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postWithImages: IPostDocument[] = [];

      for (const post of replies as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = parseJson(`${post.commentsCount}`) as number;
          post.reactions = parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
          postWithImages.push(post);
        }
      }

      return postWithImages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsWithVideosFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postWithVideos: IPostDocument[] = [];

      for (const post of replies as IPostDocument[]) {
        if (post.videoId && post.videoVersion) {
          post.commentsCount = parseJson(`${post.commentsCount}`) as number;
          post.reactions = parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
          postWithVideos.push(post);
        }
      }

      return postWithVideos;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];

      for (const post of replies as IPostDocument[]) {
        post.commentsCount = parseJson(`${post.commentsCount}`) as number;
        post.reactions = parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
        postReplies.push(post);
      }

      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalUserPostsInCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count: number = await this.client.ZCOUNT('post', uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);

      const count: number = parseInt(postCount[0], 10) - 1;
      multi.HSET(`users:${currentUserId}`, ['postsCount', count]);

      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion, profilePicture } =
      updatedPost;

    const firstList = [
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`,
      'videoId',
      `${videoId}`,
      'videoVersion',
      `${videoVersion}`
    ];

    const secondList = ['profilePicture', `${profilePicture}`, 'imgVersion', `${imgVersion}`, 'imgId', `${imgId}`];

    const dataToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.HSET(`posts:${key}`, dataToSave);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`posts:${key}`);

      const reply: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postReply = reply as IPostDocument[];

      postReply[0].commentsCount = parseJson(`${postReply[0].commentsCount}`) as number;
      postReply[0].reactions = parseJson(`${postReply[0].reactions}`) as IReactions;
      postReply[0].createdAt = new Date(parseJson(`${postReply[0].createdAt}`)) as Date;

      return postReply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
