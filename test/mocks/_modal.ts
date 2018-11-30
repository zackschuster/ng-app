import { NgModalService } from '../../src/modal';
import { $injector } from './__injector';
import { $log } from './_logger';

export const $modal = new NgModalService(
	$injector.get('$uibModal'),
	$log,
);
