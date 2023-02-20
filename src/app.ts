import databaseConnection from '@connections/database.connection';
import { config } from '@root/config';
import { SmokyServer } from '@root/server';
import express, { Express } from 'express';

class Application {
  public initialize(): void {
    this.loadConfig();

    databaseConnection();

    const app: Express = express();
    const server = new SmokyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application = new Application();
application.initialize();
