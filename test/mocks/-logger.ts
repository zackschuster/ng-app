import { NgLogger } from '../../src/services/logger';
import { $injector } from './--injector';
import { h } from './-renderer';

export const $log = new NgLogger(h, $injector.get('$log'));
