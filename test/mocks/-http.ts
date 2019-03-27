import { NgHttp } from '../../src/http';

import { $injector } from './--injector';
import { $config } from './-config';

export const $http = new NgHttp({
	onFinally() {
		$injector.get('$rootScope').$applyAsync();
	},
	getConfig() {
		return $config;
	},
});

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
			throw new Error('Currently unable to test JSONP');
		// 	return $http.Jsonp<string>(endpoint);
		default:
			throw new Error('Bad method');
	}

	return rsp;
}
