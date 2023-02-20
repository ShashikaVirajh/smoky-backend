import { ReactionQueueJobs } from '@enums';
import { IReactionJob } from '@features/reaction/reaction.interfaces';
import { BaseQueue } from '@shared/queues/base.queue';
import { reactionWorker } from '@shared/workers/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactions');
    this.processJob(ReactionQueueJobs.ADD_REACTION_TO_DB, 5, reactionWorker.addReactionToDB);
    this.processJob(ReactionQueueJobs.REMOVE_REACTION_FROM_DB, 5, reactionWorker.removeReactionFromDB);
  }

  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }
}

export const reactionQueue = new ReactionQueue();
