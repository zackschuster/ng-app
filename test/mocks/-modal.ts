import { NgModal } from '../../src/services/modal';
import { $config } from './--app';
import { $injector } from './--injector';
import { $http } from './-http';
import { $log } from './-logger';
import { $renderer } from './-renderer';

export const $modal = new NgModal($renderer, $log, $http, $config, $injector);
