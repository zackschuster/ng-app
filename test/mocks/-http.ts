import { HttpStatusCode } from '@ledge/types/http';
import { injector } from 'angular';
// import { module } from 'angular';

import { $config } from './--app';
import { NgHttp } from '../../index';

const $injector = injector(['ngMock']);

export const $http = new NgHttp(
	$injector.get('$http'),
	$injector.get('$rootScope'),
	{
		getConfig() { return $config; },
	});

// doesn't work, never gotten $sceDelegateProvider code to make a difference
// pROBABLY BECAUSE INJECTOR DOESN'T COME FROM HERE, DUDE
// module('ngMock')
// 	.config(['$sceDelegateProvider', ($sceDelegateProvider: angular.ISCEDelegateProvider) => {
// 		$sceDelegateProvider.resourceUrlWhitelist(['self', `${$prefix}/**`]);
// 	}]);

const $backend = $injector.get('$httpBackend');
export async function pingTestUrl(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'JSONP',
	endpoint: string,
) {
	const url = $http.getFullUrl(endpoint, $config.API_HOST, false);
	$backend.when(method, url).respond(HttpStatusCode.Ok, { data: `/${endpoint}` });

	// flush requests at end of event loop
	// skips an assignment dance in switch/case
	setTimeout(() => {
		try {
			$backend.verifyNoOutstandingRequest();
		} catch {
			$backend.flush();
		}
	});

	switch (method) {
		case 'GET':
			return $http.Get<string>(endpoint);
		case 'POST':
			return $http.Post<string>(endpoint, endpoint);
		case 'PUT':
			return $http.Put<string>(endpoint, endpoint);
		case 'PATCH':
			return $http.Patch<string>(endpoint, [{ op: 'add', path: '/path', value: endpoint }]);
		case 'DELETE':
			return $http.Delete<string>(endpoint);
		case 'JSONP':
			// return $http.Jsonp<string>(endpoint);
			throw new Error('Currently unable to test JSONP');
		default:
			throw new Error('Bad method');
	}
}
