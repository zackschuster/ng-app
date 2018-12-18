import { NgLogger } from '../../src/logger';
import { $injector } from './--injector';

export const $log = new NgLogger($injector.get('$log'));
