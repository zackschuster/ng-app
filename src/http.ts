import { PatchPayload } from '@ledge/types/patch';
import { NgService } from './service';

export const DEFAULT_REQUEST_TIMEOUT = 10000;

export interface NgHttpOptions {
	/**
	 * The host domain to use for making requests. Defaults to `location.host`
	 */
	host?: string | (() => string);
	/**
	 * How many milliseconds to wait before aborting the request. Defaults to `undefined` (no timeout)
	 */
	timeout?: number | (() => number | undefined);
}

export class NgHttp extends NgService {
	constructor(
		private $http: angular.IHttpService,
		private $rootScope: angular.IRootScopeService | (() => angular.IRootScopeService),
		private options: NgHttpOptions,
	) {
		super();
	}

	public Get<T = any>(url: string) {
		return this.fetch<T>(url, 'GET');
	}

	public Post<T = any>(url: string, data: any = null) {
		return this.fetch<T>(url, 'POST', data);
	}

	public Patch<T = any>(url: string, data: PatchPayload) {
		return this.fetch<T>(url, 'PATCH', data);
	}

	public Put<T = any>(url: string, data: any) {
		return this.fetch<T>(url, 'PUT', data);
	}

	public Delete<T = any>(url: string) {
		return this.fetch<T>(url, 'DELETE');
	}

	/**
	 * @note Not recommended for use due to idiosyncrasies in Angular.js' JSONP support
	 */
	public Jsonp<T = any>(url: string) {
		return this.fetch<T>(url, 'JSONP');
	}

	public getFullUrl(uri: string, host = location.host, ssl = location.protocol === 'https:') {
		return typeof uri !== 'string' ? uri : `http${ssl ? 's' : ''}://${host}/${uri}`;
	}

	private fetch<T>(
		uri: string,
		method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'JSONP',
		data?: any,
	) {
		let { host, timeout } = this.options;
		if (typeof host === 'function') {
			host = host();
		}
		if (typeof timeout === 'function') {
			timeout = timeout();
		}
		return this.$http<T>({
			withCredentials: true,
			url: this.getFullUrl(uri, host),
			timeout,
			method,
			data,
			params: {
				timestamp: (this.isIE11 ? Date.now() : null),
			},
		})
			.then(res => res.data)
			.finally(() =>
				(typeof this.$rootScope === 'function' ? this.$rootScope() : this.$rootScope).$applyAsync());
	}
}

/**
 * @deprecated
 */
export type NgHttpInterceptor = angular.IHttpInterceptor;
