import { HttpStatusCode } from '@ledge/types/http';
import type { } from 'angular-mocks';

import { $config } from './--app';
import { NgHttp } from '../../index';

const $injector = window.angular.injector(['ngMock']);

export const $http = new NgHttp(
	$injector.get('$http'),
	$injector.get('$rootScope'),
	{
		host: $config.API_HOST,
	});

const $backend = $injector.get('$httpBackend');
const $sce = $injector.get('$sce');
export async function pingTestUrl(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'JSONP',
	endpoint: string,
	{ useSce } = { useSce: method === 'JSONP' },
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

	const requestUrl = useSce ? $sce.trustAsResourceUrl(url) : endpoint;
	switch (method) {
		case 'GET':
			return $http.Get<{ data: string; }>(requestUrl);
		case 'POST':
			return $http.Post<{ data: string; }>(requestUrl, endpoint);
		case 'PUT':
			return $http.Put<{ data: string; }>(requestUrl, endpoint);
		case 'PATCH':
			return $http.Patch<{ data: string; }>(requestUrl, [{ op: 'add', path: '/path', value: endpoint }]);
		case 'DELETE':
			return $http.Delete<{ data: string; }>(requestUrl);
		case 'JSONP':
			return $http.Jsonp<{ data: string; }>(requestUrl);
		default:
			throw new Error('Bad method');
	}
}
