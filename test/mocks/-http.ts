// import { module } from 'angular';
import { NgHttp } from '../../src/services/http';
import { $injector } from './--injector';
import { $config } from './-config';

export const $http = new NgHttp($injector.get('$http'), {
	onFinally() {
		$injector.get('$rootScope').$applyAsync();
	},
	getConfig() {
		return $config;
	},
});

// doesn't work, never gotten $sceDelegateProvider code to make a difference
// module('ngMock')
// 	.config(['$sceDelegateProvider', ($sceDelegateProvider: angular.ISCEDelegateProvider) => {
// 		$sceDelegateProvider.resourceUrlWhitelist(['self', `${$prefix}/**`]);
// 	}]);

const $backend = $injector.get('$httpBackend');
export async function pingTestUrl(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'JSONP',
	endpoint: string,
) {
	const url = $http.getFullUrl(endpoint);
	$backend.when(method, url).respond(200, endpoint);

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
			throw new Error('Currently unable to test JSONP');
		// 	return $http.Jsonp<string>(endpoint);
		default:
			throw new Error('Bad method');
	}
}
