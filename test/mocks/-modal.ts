import { NgModal } from '../../src/services/modal';
import { $log } from './-logger';
import { $injector } from './--injector';

export const $modal = new NgModal($log, $injector.get('$compile'), $injector.get('$controller'), $injector.get('$rootScope'));
