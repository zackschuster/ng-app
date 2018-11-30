import { NgLogger } from '../../src/services/logger';
import { $injector } from './__injector';

export const $log = new NgLogger($injector.get('$log'));
