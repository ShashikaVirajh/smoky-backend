import { emailTransport } from '@library/email-transport.library';
import { Logger } from '@library/logger.library';
import { DoneCallback, Job } from 'bull';

const log = Logger.create('email-worker');

class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data;
      await emailTransport.sendEmail(receiverEmail, subject, template);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker = new EmailWorker();
