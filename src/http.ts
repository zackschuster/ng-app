import { PatchPayload } from '@ledge/types/patch';
import { NgLogger } from './logger';
import { NgService } from './service';

export class NgDataService extends NgService {
	constructor(
		private $http: angular.IHttpService,
		private $timeout: angular.ITimeoutService,
		private $log: NgLogger,
		private prefix: string,
		private baseOptions: angular.IRequestShortcutConfig = { withCredentials: true },
	) {
		super();
	}

	public async Get<T = any>(url: string, defaultReturn?: T) {
		const baseGetOptions = { params: { timestamp: (this.isIE11 ? Date.now() : null) } };

		const promise = this.$http.get<T>(
			this.getFullUrl(url),
			Object.assign(baseGetOptions, this.baseOptions),
		);

		return this.safeAwait(promise, defaultReturn);
	}

	public async Post<T = any>(url: string, data: any = null) {
		const promise = this.$http.post<T>(this.getFullUrl(url), data, this.baseOptions);
		return this.safeAwait(promise);
	}

	public async Patch<T = any>(url: string, data: PatchPayload) {
		const promise = this.$http.patch<T>(this.getFullUrl(url), data, this.baseOptions);
		return this.safeAwait(promise);
	}

	public async Put<T = any>(url: string, data: T) {
		const promise = this.$http.put<T>(this.getFullUrl(url), data, this.baseOptions);
		return this.safeAwait(promise);
	}

	public async Delete<T = any>(url: string) {
		const promise = this.$http.delete<T>(this.getFullUrl(url), this.baseOptions);
		return this.safeAwait(promise);
	}

	public async Jsonp<T = any>(url: string) {
		const promise = this.$http.jsonp<T>(this.getFullUrl(url), this.baseOptions);
		return this.safeAwait(promise);
	}

	public getFullUrl(endpoint: string) {
		const hasSlash = this.prefix.endsWith('/') || endpoint.startsWith('/');
		return `${this.prefix}${hasSlash ? '' : '/'}${endpoint}`;
	}

	private async safeAwait<T>(promise: angular.IHttpPromise<T>, defaultReturn: T = null as any) {
		try {
			return await new Promise<T>((resolve, reject) => {
				promise
					.then(({ data }) => resolve(data == null ? defaultReturn : data))
					.catch(err => reject(err))
					.finally(() => this.$timeout());
			});
		} catch (err) {
			this.onError(err);
			throw err;
		}
	}

	private onError(err: angular.IHttpPromiseCallbackArg<any>) {
		let url = '';
		if (err.config != null) {
			({ url } = err.config);
		}

		switch (err.status) {
			case 404:
				this.$log.devWarning(`Route '${url}' not found`);
				break;
			case 500:
				const { data, statusText } = err;
				this.$log.error(this.isValidString(data) ? data : statusText as string);
				break;
			case 400:
				const msg = err.data;
				if (typeof msg === 'string') {
					this.$log.error(msg);
				} else if (this.isValidObject(msg)) {
					const message = Object.keys(msg).map(x => `${x}: ${msg[x]}`).join('\n');
					this.$log.error(message);
				}
				break;
			case 401:
				this.$log.warning(err.statusText as string);
				break;
			case -1:
				this.$log.warning('Server timed out.');
				break;
			default:
				this.$log.devWarning(`An unregistered error occurred for '${url}' (code: ${err.status})`);
				break;
		}
	}

	private isValidString(data: any): data is string {
		return typeof data === 'string' && data.length > 0;
	}

	private isValidObject(obj: any): obj is { [key: string]: any } {
		return obj != null && obj.toString() === '[object Object]';
	}
}
