import { PatchPayload } from '@ledge/types/patch';
import { NgService } from './service';
import { NgAppConfig } from './options';

export const DEFAULT_REQUEST_TIMEOUT = 10000;

export interface NgHttpOptions {
	/**
	 * Defaults to `location.host`
	 */
	host?: string;

	/**
	 * If true, use `https://`. Otherwise, use `http://`
	 */
	ssl?: boolean;

	headers?: object;

	/**
	 * How many milliseconds to wait before aborting the request. Defaults to `10000` (10 seconds)
	 */
	timeout?: number;

	withCredentials?: boolean;

	getConfig(): NgAppConfig;
	responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
}

export class NgHttp extends NgService {
	constructor(
		private $http: angular.IHttpService,
		private $rootScope: angular.IRootScopeService,
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

	public Put<T = any>(url: string, data: T) {
		return this.fetch(url, 'PUT', data);
	}

	public Delete<T = any>(url: string) {
		return this.fetch<T>(url, 'DELETE');
	}

	public Jsonp<T = any>(url: string) {
		return this.fetch<T>(url, 'JSONP');
	}

	public getFullUrl(uri: string, host: string, ssl: boolean) {
		return `http${ssl ? 's' : ''}://${host}/${uri}`;
	}

	private fetch<T>(
		uri: string,
		method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'JSONP',
		data?: any,
	) {
		const {
			host = this.options.getConfig().API_HOST,
			ssl = location.protocol === 'https:',
			withCredentials = false,
			headers = {},
			timeout = DEFAULT_REQUEST_TIMEOUT,
			responseType = 'json',
		} = this.options;

		const url = this.getFullUrl(uri, host, ssl);

		const request: angular.IRequestConfig = {
			data,
			headers,
			method,
			responseType,
			timeout,
			url,
			withCredentials,
			params: {
				timestamp: (this.isIE11 ? Date.now() : null),
			},
		};

		return this.$http<T>(request).then(res => {
			this.$rootScope.$applyAsync();
			return res.data;
		});
	}
}

/**
 * @deprecated
 */
export type NgHttpInterceptor = angular.IHttpInterceptor;
