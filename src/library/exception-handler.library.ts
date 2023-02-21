import { Logger } from '@library/logger.library';

const log = Logger.create('exception-handler');

export class ExceptionHandler {
  public static handleExit(): void {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an uncaught error: ${error}`);
      ExceptionHandler.shutDownProperly(1);
    });

    process.on('unhandleRejection', (reason: Error) => {
      log.error(`Unhandled rejection at promise: ${reason}`);
      ExceptionHandler.shutDownProperly(2);
    });

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM');
      ExceptionHandler.shutDownProperly(2);
    });

    process.on('SIGINT', () => {
      log.error('Caught SIGINT');
      ExceptionHandler.shutDownProperly(2);
    });

    process.on('exit', () => {
      log.error('Exiting');
    });
  }

  private static async shutDownProperly(exitCode: number): Promise<void> {
    try {
      log.info('Shutdown complete');
      process.exit(exitCode);
    } catch (error) {
      log.error(`Error during shutdown: ${error}`);
      process.exit(1);
    }
  }
}
