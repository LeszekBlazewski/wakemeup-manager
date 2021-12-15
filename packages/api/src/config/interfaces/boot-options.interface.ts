import { OS } from 'src/types';

export interface BootOptions {
  wolAgentUrl: string;
  wolAgentSecret: string;
  bootTokenSecret: string;
  [x: string | OS]: number | string;
}
