import { NgModal } from '../../src/services/modal';
import { $config } from './--app';
import { $injector } from './--injector';
import { $http } from './-http';
import { $log } from './-logger';
import { h } from './-renderer';

export const $modal = new NgModal(h, $log, $http, $config, $injector);
