// import { module } from 'angular';
import { NgDataService } from '../../src/http';
import { $injector } from './__injector';
import { $log } from './_logger';

export const $prefix = 'http://localhost:2323';
export const $http = new NgDataService($injector.get('$http'), $log, $prefix);

// doesn't work, never gotten $sceDelegateProvider code to make a difference
// module('ngMock')
// 	.config(['$sceDelegateProvider', ($sceDelegateProvider: angular.ISCEDelegateProvider) => {
// 		$sceDelegateProvider.resourceUrlWhitelist(['self', `${$prefix}/**`]);
// 	}]);

const $backend = $injector.get('$httpBackend');
export async function pingTestUrl(
	// tslint:disable-next-line:jsdoc-format
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' /**| 'JSONP'*/,
	endpoint: string,
) {
	const url = $http.getFullUrl(endpoint);
	$backend.when(method, url).respond(200, endpoint);

	let p: Promise<string>;

	switch (method) {
		case 'GET':
			p = $http.Get<string>(endpoint);
			break;
		case 'POST':
			p = $http.Post<string>(endpoint, endpoint);
			break;
		case 'PUT':
			p = $http.Put<string>(endpoint, endpoint);
			break;
		case 'PATCH':
			p = $http.Patch<string>(endpoint, [{ op: 'add', path: '/path', value: endpoint }]);
			break;
		case 'DELETE':
			p = $http.Delete<string>(endpoint);
			break;
		// case 'JSONP':
		// 	p = $http.Jsonp<string>(endpoint);
		// 	break;
		default:
			throw new Error('Bad method');
	}

	$backend.flush();
	return p;
}
