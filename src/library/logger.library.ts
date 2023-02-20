import bunyan from 'bunyan';

export class Logger {
  static create = (name: string): bunyan => {
    return bunyan.createLogger({ name, level: 'debug' });
  };
}
