import { $config } from './--app';
import { $injector } from './--injector';
import { $http } from './-http';
import { $log } from './-logger';

import { NgModal, NgModalOptions } from '../../index';

export const $openNewModal = (options: NgModalOptions = {}) =>
	new NgModal($log, $http, $config, $injector).open(options);
