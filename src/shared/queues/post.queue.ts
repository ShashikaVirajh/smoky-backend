import { PostQueueJobs } from '@enums';
import { IPostJobData } from '@features/post/post.interfaces';
import { BaseQueue } from '@shared/queues/base.queue';
import { postWorker } from '@shared/workers/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('posts');

    this.processJob(PostQueueJobs.ADD_POST_TO_DB, 5, postWorker.addPostToDB);
    this.processJob(PostQueueJobs.UPDATE_POST_IN_DB, 5, postWorker.updatePostInDB);
    this.processJob(PostQueueJobs.DELETE_POST_FROM_DB, 5, postWorker.deletePostFromDB);
  }

  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postQueue = new PostQueue();
