import { PatchPayload } from '@ledge/types/patch';
import { isFunction } from 'angular';
import { NgService } from './service';

export class NgDataService extends NgService {
	constructor(
		private $http: angular.IHttpService,
		private interceptors: angular.IHttpInterceptor[],
		private update: () => void,
		private prefixGetter: () => string,
		private baseOptions: angular.IRequestShortcutConfig = { withCredentials: true },
	) {
		super();

		this.$http.defaults = Object.assign(
			this.$http.defaults, {
				params: {
					timestamp: (this.isIE11 ? Date.now() : null),
				},
			}, this.baseOptions);
	}

	public async Get<T = any>(url: string) {
		return this.wrapQPromise(this.$http.get<T>(this.getFullUrl(url)));
	}

	public async Post<T = any>(url: string, data: any = null) {
		return this.wrapQPromise(
			this.$http.post<T>(this.getFullUrl(url), data),
		);
	}

	public async Patch<T = any>(url: string, data: PatchPayload) {
		return this.wrapQPromise(
			this.$http.patch<T>(this.getFullUrl(url), data),
		);
	}

	public async Put<T = any>(url: string, data: T) {
		return this.wrapQPromise(
			this.$http.put<T>(this.getFullUrl(url), data),
		);
	}

	public async Delete<T = any>(url: string) {
		return this.wrapQPromise(
			this.$http.delete<T>(this.getFullUrl(url)),
		);
	}

	public async Jsonp<T = any>(url: string) {
		return this.wrapQPromise(
			this.$http.jsonp<T>(this.getFullUrl(url)),
		);
	}

	public getFullUrl(endpoint: string) {
		const prefix = this.prefixGetter();
		const hasSlash = prefix.endsWith('/') || endpoint.startsWith('/');
		return `${prefix}${hasSlash ? '' : '/'}${endpoint}`;
	}

	private async wrapQPromise<T>(promise: angular.IHttpPromise<T>) {
		try {
			const { data } = await promise;
			return data;
		} catch (err) {
			for (const onResponseError of this.interceptors.map(x => x.responseError)) {
				if (isFunction(onResponseError)) {
					err = await onResponseError(err);
				}
			}
			throw err;
		} finally {
			this.update();
		}
	}
}
