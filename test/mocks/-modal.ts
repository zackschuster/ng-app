import { NgModal } from '../../src/services/modal';
import { $log } from './-logger';
import { $injector } from './--injector';
import { $http } from './-http';
import { $config } from './-config';
import { h } from './-renderer';

export const $modal = new NgModal(h, $log, $http, $config, $injector);
