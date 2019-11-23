import { NgModal } from '../../src/services/modal';
import { $config } from './--app';
import { $injector } from './--injector';
import { $http } from './-http';
import { $log } from './-logger';

export const $modal = new NgModal($log, $http, $config, $injector);
