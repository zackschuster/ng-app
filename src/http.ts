import { PatchPayload } from '@ledge/types/patch';
import { NgService } from './service';
import { NgAppConfig } from './options';

export const DEFAULT_REQUEST_TIMEOUT = 10000;

export interface NgHttpInterceptor {
	request?(config: angular.IHttpRequestConfigHeaders):
		angular.IHttpRequestConfigHeaders | PromiseLike<angular.IHttpRequestConfigHeaders>;
	response?(response: angular.IHttpResponse<any>): angular.IHttpResponse<any>;
	responseError?(err: any): any;
}

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

	interceptors?: NgHttpInterceptor[];

	withCredentials?: boolean;

	getConfig(): NgAppConfig;
	responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
}

export class NgHttp extends NgService {
	private interceptors: {
		request: (
			(config: angular.IHttpRequestConfigHeaders)
				=> angular.IHttpRequestConfigHeaders | PromiseLike<angular.IHttpRequestConfigHeaders>
		)[];
		response: ((response: angular.IHttpResponse<any>) => angular.IHttpResponse<any>)[];
		responseError: (<T extends Error>(err: T) => void)[];
	};

	constructor(
		private $http: angular.IHttpService,
		private $rootScope: angular.IRootScopeService,
		private options: NgHttpOptions,
	) {
		super();
		const { interceptors = [] } = options;
		this.interceptors = {
			request: interceptors
				.map(x => x.request)
				.filter(x => typeof x === 'function') as
				((config: angular.IHttpRequestConfigHeaders)
					=> angular.IHttpRequestConfigHeaders | PromiseLike<angular.IHttpRequestConfigHeaders>)[],
			response: interceptors
				.map(x => x.response)
				.filter(x => typeof x === 'function') as
				((response: angular.IHttpResponse<any>) => angular.IHttpResponse<any>)[],
			responseError: interceptors
				.map(x => x.responseError)
				.filter(x => typeof x === 'function') as
				((err: any) => any)[],
		};
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
			transformRequest: this.interceptors.request,
			transformResponse: this.interceptors.response,
		};

		return this.$http<T>(request)
			.then(res => {
				this.$rootScope.$applyAsync();
				return res.data;
			})
			.catch(err => {
				for (const onResponseError of this.interceptors.responseError) {
					err = onResponseError(err);
				}
				return err;
			});
	}
}
