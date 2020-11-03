import { $config } from './--app';
import { $injector } from './--injector';
import { $http } from './-http';
import { $log } from './-logger';

import { NgModal } from '../..';

export const $modal = new NgModal($log, $http, $config, $injector);
