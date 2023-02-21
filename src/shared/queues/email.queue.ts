import { EmailTypes } from '@enums';
import { IEmailJob } from '@features/user/interfaces/user.interface';
import { BaseQueue } from '@shared/queues/base.queue';
import { emailWorker } from '@shared/workers/email.worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('emails');

    this.processJob(EmailTypes.FORGOT_PASSWORD, 5, emailWorker.addNotificationEmail);
    this.processJob(EmailTypes.CHANGE_PASSWORD, 5, emailWorker.addNotificationEmail);
    this.processJob(EmailTypes.COMMENT, 5, emailWorker.addNotificationEmail);
    this.processJob(EmailTypes.REACTION, 5, emailWorker.addNotificationEmail);
    this.processJob(EmailTypes.FOLLOWER, 5, emailWorker.addNotificationEmail);
    this.processJob(EmailTypes.DIRECT_MESSAGE, 5, emailWorker.addNotificationEmail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue = new EmailQueue();
