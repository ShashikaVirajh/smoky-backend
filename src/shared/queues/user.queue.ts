import { UserQueueJobs } from '@enums';
import { BaseQueue } from '@shared/queues/base.queue';
import { userWorker } from '@shared/workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob(UserQueueJobs.ADD_USER_DETAILS_TO_DB, 5, userWorker.addUserToDB);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}

export const userQueue = new UserQueue();
