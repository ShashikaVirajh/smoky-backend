import { config } from '@root/config';

export const isDevApp = () => ['test', 'development'].includes(config.NODE_ENV!);
export const isProdApp = () => config.NODE_ENV === 'production';
