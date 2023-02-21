import { authService } from '@features/auth/auth.service';
import { Logger } from '@library/logger.library';
import { DoneCallback, Job } from 'bull';

const log = Logger.create('auth-worker');

class AuthWorker {
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await authService.createAuthUser(value);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const authWorker = new AuthWorker();
