import { PatchPayload } from '@ledge/types/patch';
import { NgService } from './service';

export class NgDataService extends NgService {
	constructor(
		private $http: angular.IHttpService,
		private $timeout: angular.ITimeoutService,
		private prefix: string,
		private baseOptions: angular.IRequestShortcutConfig = { withCredentials: true },
	) {
		super();
	}

	public async Get<T = any>(url: string, defaultReturn?: T) {
		const baseGetOptions = { params: { timestamp: (this.isIE11 ? Date.now() : null) } };

		return this.wrapQPromise(
			this.$http.get<T>(this.getFullUrl(url), Object.assign(baseGetOptions, this.baseOptions)),
			defaultReturn,
		);
	}

	public async Post<T = any>(url: string, data: any = null) {
		return this.wrapQPromise(
			this.$http.post<T>(this.getFullUrl(url), data, this.baseOptions),
		);
	}

	public async Patch<T = any>(url: string, data: PatchPayload) {
		return this.wrapQPromise(
			this.$http.patch<T>(this.getFullUrl(url), data, this.baseOptions),
		);
	}

	public async Put<T = any>(url: string, data: T) {
		return this.wrapQPromise(
			this.$http.put<T>(this.getFullUrl(url), data, this.baseOptions),
		);
	}

	public async Delete<T = any>(url: string) {
		return this.wrapQPromise(
			this.$http.delete<T>(this.getFullUrl(url), this.baseOptions),
		);
	}

	public async Jsonp<T = any>(url: string) {
		return this.wrapQPromise(
			this.$http.jsonp<T>(this.getFullUrl(url), this.baseOptions),
		);
	}

	public getFullUrl(endpoint: string) {
		const hasSlash = this.prefix.endsWith('/') || endpoint.startsWith('/');
		return `${this.prefix}${hasSlash ? '' : '/'}${endpoint}`;
	}

	private async wrapQPromise<T>(promise: angular.IHttpPromise<T>, defaultReturn: T = null as any) {
		return new Promise<T>((resolve, reject) => {
			promise
				.then(({ data }) => resolve(data == null ? defaultReturn : data))
				.catch(err => reject(err))
				.finally(() => this.$timeout());
		});
	}
}
