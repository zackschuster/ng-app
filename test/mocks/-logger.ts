import { NgConsole, NgLogger } from '../../src/services/logger';
import { h } from './-renderer';

export const $console = new NgConsole();
export const $log = new NgLogger(h);
