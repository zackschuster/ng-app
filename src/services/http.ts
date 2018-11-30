import { PatchPayload } from '@ledge/types/patch';
import { isFunction } from 'angular';
import { NgService } from './base';

export class NgDataService extends NgService {
	constructor(
		private $http: angular.IHttpService,
		private interceptors: angular.IHttpInterceptor[],
		private update: () => void,
		private prefixGetter: () => string,
		private options: angular.IRequestShortcutConfig = { withCredentials: true },
	) {
		super();
	}

	public async Get<T = any>(url: string) {
		url = this.getFullUrl(url);
		return this.fulfillRequest(
			this.$http.get<T>(url, await this.getRequestConfig('GET', url)),
		);
	}

	public async Post<T = any>(url: string, data: any = null) {
		url = this.getFullUrl(url);
		return this.fulfillRequest(
			this.$http.post<T>(url, data, await this.getRequestConfig('POST', url)),
		);
	}

	public async Patch<T = any>(url: string, data: PatchPayload) {
		url = this.getFullUrl(url);
		return this.fulfillRequest(
			this.$http.patch<T>(url, data, await this.getRequestConfig('PATCH', url)),
		);
	}

	public async Put<T = any>(url: string, data: T) {
		url = this.getFullUrl(url);
		return this.fulfillRequest(
			this.$http.put<T>(url, data, await this.getRequestConfig('PUT', url)),
		);
	}

	public async Delete<T = any>(url: string) {
		url = this.getFullUrl(url);
		return this.fulfillRequest(
			this.$http.delete<T>(url, await this.getRequestConfig('DELETE', url)),
		);
	}

	public async Jsonp<T = any>(url: string) {
		return this.fulfillRequest(
			this.$http.jsonp<T>(url, await this.getRequestConfig('JSONP', url)),
		);
	}

	public getFullUrl(endpoint: string) {
		const prefix = this.prefixGetter();
		const hasSlash = prefix.endsWith('/') || endpoint.startsWith('/');
		return `${prefix}${hasSlash ? '' : '/'}${endpoint}`;
	}

	private async getRequestConfig(method: string, url: string) {
		let options = Object.assign({
			method,
			url,
			params: {
				timestamp: (this.isIE11 ? Date.now() : null),
			},
		}, this.options);

		for (const onRequest of this.interceptors.map(x => x.request)) {
			if (isFunction(onRequest)) {
				options = await onRequest(options) as typeof options;
			}
		}

		return options;
	}

	private async fulfillRequest<T>(promise: angular.IHttpPromise<T>) {
		try {
			let response = await promise;
			for (const onResponse of this.interceptors.map(x => x.response)) {
				if (isFunction(onResponse)) {
					response = await onResponse<T>(response);
				}
			}
			return response.data;
		} catch (err) {
			for (const onResponseError of this.interceptors.map(x => x.responseError)) {
				if (isFunction(onResponseError)) {
					err = await onResponseError<T>(err);
				}
			}
			throw err;
		} finally {
			this.update();
		}
	}
}
