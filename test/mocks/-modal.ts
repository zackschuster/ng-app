import { NgModalService } from '../../src/services/modal';
import { $injector } from './--injector';
import { $log } from './-logger';

export const $modal = new NgModalService(
	$injector.get('$uibModal'),
	$log,
);
