// import { reactionService } from '@features/reaction/reaction.service';
import { Logger } from '@library/logger.library';
import { DoneCallback, Job } from 'bull';

const log = Logger.create('reaction-worker');

class ReactionWorker {
  async addReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      // await reactionService.addReactionDataToDB(data);

      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      // await reactionService.removeReactionDataFromDB(data);

      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const reactionWorker = new ReactionWorker();
