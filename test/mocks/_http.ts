import { NgDataService } from '../../src/http';
import { $injector } from './__injector';
import { $log } from './_logger';

export const $backend = $injector.get('$httpBackend');
export const $prefix = 'http://localhost:2323';
export const $httpBare = $injector.get('$http');
export const $http = new NgDataService($httpBare, $log, $prefix);
