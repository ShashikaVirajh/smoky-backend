import { AuthQueueJobs } from '@enums';
import { IAuthJob } from '@features/auth/interfaces/auth.interfaces';
import { BaseQueue } from '@shared/queues/base.queue';
import { authWorker } from '@shared/workers/auth.worker';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob(AuthQueueJobs.ADD_AUTH_USER_TO_DB, 5, authWorker.addAuthUserToDB);
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue = new AuthQueue();
