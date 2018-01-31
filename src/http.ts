import { IHttpPromise, IHttpPromiseCallbackArg, IHttpService } from 'angular';
import { PatchPayload } from '@ledge/types';

import isIE11 from '@ledge/is-ie-11';

import { NgLogger } from './logger';
import { app } from '../index';

export class NgDataService {
	// tslint:disable-next-line:no-non-null-assertion
	private prefix = app.config.PREFIX!.API;
	private baseOptions = { timeout: app.config.ENV === 'production' ? 10000 : undefined, withCredentials: true };

	constructor(private $http: IHttpService, private logger: NgLogger) {}

	public async Get<T = any>(url: string, defaultReturn?: T) {
		const baseGetOptions = { params: { timestamp: (isIE11() ? Date.now() : null) } };
		const options = Object.assign(baseGetOptions, this.baseOptions);
		const promise = this.$http.get<T>(this.prefix + url, options);
		return this.safeAwait(promise, defaultReturn) as Promise<T>;
	}

	public async Post<T = any>(url: string, data: any = null) {
		const promise = this.$http.post<T>(this.prefix + url, data, this.baseOptions);
		return this.safeAwait(promise) as Promise<T>;
	}

	public async Patch<T extends PatchPayload = PatchPayload>(url: string, data: T) {
		const promise = this.$http.patch<T>(this.prefix + url, data, this.baseOptions);
		return this.safeAwait(promise) as Promise<T>;
	}

	private async safeAwait<T>(promise: IHttpPromise<T>, defaultReturn?: T) {
		try {
			const rsp = await promise;
			return rsp == null ? defaultReturn : rsp.data;
		} catch (err) {
			this.onError(err);
			throw err;
		}
	}

	// tslint:disable-next-line:cyclomatic-complexity
	private onError(err: IHttpPromiseCallbackArg<any>) {
		switch (err.status) {
			case 404:
				// tslint:disable-next-line:no-non-null-assertion
				this.logger.devWarning(`Route '${err.config!.url}' not found`);
				break;
			case 500:
				const { data, statusText } = err;
				this.logger.error(typeof data === 'string' && data.length > 0 ? data : statusText as string);
				break;
			case 400:
				const msg = err.data;
				if (typeof msg === 'string') {
					this.logger.error(msg);
				} else if (msg != null && !Array.isArray(msg)) {
					let message = '';
					Object.keys(msg).forEach(x => {
						message += `${x}: ${msg[x]}\n`;
					});
					this.logger.error(message);
				}
				break;
			case 401:
				this.logger.warning(err.statusText as string);
				break;
			case -1:
				this.logger.warning('Server timed out.');
				break;
			default:
				// tslint:disable-next-line:no-non-null-assertion
				this.logger.devWarning(`An unregistered error occurred for '${err.config!.url}' (code: ${err.status})`);
				break;
		}
	}
}
