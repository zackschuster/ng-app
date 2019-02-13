import { NgModal } from '../../src/services/modal';
import { $log } from './-logger';
import { $injector } from './--injector';
import { $http } from './-http';
import { $config } from './-config';

export const $modal = new NgModal($log, $http, $config, $injector);
