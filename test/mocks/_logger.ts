import { NgLogger } from '../../src/logger';
import { $injector } from './__injector';

export const logger = new NgLogger($injector.get('$log'));
