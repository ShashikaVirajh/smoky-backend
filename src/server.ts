import 'express-async-errors';

import { CustomError, IErrorResponse } from '@library/error-handler.library';
import { Logger } from '@library/logger.library';
import { config } from '@root/config';
import appRoutes from '@root/routes';
import { createAdapter } from '@socket.io/redis-adapter';
import { SocketIOChatHandler } from '@socket/chat';
import { SocketIOFollowerHandler } from '@socket/follower';
import { SocketIOImageHandler } from '@socket/image';
import { SocketIONotificationHandler } from '@socket/notification';
import { SocketIOPostHandler } from '@socket/post';
import { SocketIOUserHandler } from '@socket/user';
import compression from 'compression';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import HTTP_STATUS from 'http-status-codes';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import apiStats from 'swagger-stats';

const log = Logger.create('server');

export class SmokyServer {
  private app: Application;

  constructor(application: Application) {
    this.app = application;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.apiMonitoring(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private apiMonitoring(app: Application): void {
    app.use(apiStats.getMiddleware({ uriPath: '/api-monitoring' }));
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }

      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    if (!config.ACCESS_TOKEN_SECRET) throw new Error('ACCESS_TOKEN_SECRET must be provided');

    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);

      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Worker with process id of ${process.pid} has started..`);
    log.info(`Server has started with process ${process.pid}`);

    httpServer.listen(config.SERVER_PORT, () => {
      log.info(`Server running on port ${config.SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const postSocketHandler = new SocketIOPostHandler(io);
    const followerSocketHandler = new SocketIOFollowerHandler(io);
    const userSocketHandler = new SocketIOUserHandler(io);
    const chatSocketHandler = new SocketIOChatHandler(io);
    const notificationSocketHandler = new SocketIONotificationHandler();
    const imageSocketHandler = new SocketIOImageHandler();

    postSocketHandler.listen();
    followerSocketHandler.listen();
    userSocketHandler.listen();
    chatSocketHandler.listen();
    notificationSocketHandler.listen(io);
    imageSocketHandler.listen(io);
  }
}
