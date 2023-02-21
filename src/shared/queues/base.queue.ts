import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { IAuthJob } from '@features/auth/auth.interfaces';
import { IPostJobData } from '@features/post/interfaces/post.interface';
import { IReactionJob } from '@features/reactions/interfaces/reaction.interface';
import { IEmailJob } from '@features/user/interfaces/user.interface';
import { Logger } from '@library/logger.library';
import { config } from '@root/config';
import BullQueue, { Job, ProcessCallbackFunction, Queue } from 'bull';
import BunyanLogger from 'bunyan';

type IBaseJobData = IAuthJob | IEmailJob | IPostJobData | IReactionJob;

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue;
  log: BunyanLogger;

  constructor(queueName: string) {
    this.queue = new BullQueue(queueName, `${config.REDIS_HOST}`);

    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.log = Logger.create(`${queueName}-queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(name: string, concurrency: number, callback: ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }
}
