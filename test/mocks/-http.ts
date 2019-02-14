// import { module } from 'angular';
import { injector } from 'angular';

import { NgHttp } from '../../src/services/http';
import { $config } from './--app';

const $injector = injector(['ngMock']);

export const $http = new NgHttp({
	onFinally() {
		$injector.get('$rootScope').$applyAsync();
	},
	getConfig() {
		return $config;
	},
});

// doesn't work, never gotten $sceDelegateProvider code to make a difference
// pROBABLY BECAUSE INJECTOR DOESN'T COME FROM HERE, DUDE
// module('ngMock')
// 	.config(['$sceDelegateProvider', ($sceDelegateProvider: angular.ISCEDelegateProvider) => {
// 		$sceDelegateProvider.resourceUrlWhitelist(['self', `${$prefix}/**`]);
// 	}]);

export async function pingTestUrl(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'JSONP',
	endpoint: string,
) {
	let rsp: any;
	switch (method) {
		case 'GET':
			rsp = await $http.Get<string>(endpoint);
			break;
		case 'POST':
			rsp = await $http.Post<string>(endpoint, endpoint);
			break;
		case 'PUT':
			rsp = await $http.Put<string>(endpoint, endpoint);
			break;
		case 'PATCH':
			rsp = await $http.Patch<string>(endpoint, [{ op: 'add', path: '/path', value: endpoint }]);
			break;
		case 'DELETE':
			rsp = await $http.Delete<string>(endpoint);
			break;
		case 'JSONP':
			// return $http.Jsonp<string>(endpoint);
			throw new Error('Currently unable to test JSONP');
		default:
			throw new Error('Bad method');
	}

	return rsp;
}
