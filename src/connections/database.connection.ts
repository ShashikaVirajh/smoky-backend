import { redisConnection } from '@connections/redis.connection';
import { Logger } from '@library/logger.library';
import { config } from '@root/config';
import mongoose from 'mongoose';

const log = Logger.create('database-connection');

export default async (): Promise<void> => {
  const connect = async (): Promise<void> => {
    mongoose.set('strictQuery', true);

    try {
      await mongoose.connect(config.DATABASE_URL || '');
      log.info('Successfully connected to database.');

      redisConnection.connect();
    } catch (error) {
      log.error('Error connecting to database', error);
      return process.exit(1);
    }
  };

  connect();

  mongoose.connection.on('disconnected', connect);
};
