import { NgModalService } from '../../src/modal';
import { $injector } from './__injector';
import { $http } from './_http';
import { $log } from './_logger';

export const $modal = new NgModalService(
	$injector.get('$uibModal'),
	$injector.get('$timeout'),
	$http,
	$log,
);
