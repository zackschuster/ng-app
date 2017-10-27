import { IHttpPromise, IHttpPromiseCallbackArg, IHttpService } from 'angular';
import { NgLogger } from './logger';
import { app } from '../index';

import isIE11 from '@ledge/is-ie-11';

export class NgDataService {
	private prefix = app.config.PREFIX.API;
	private baseOptions = { timeout: app.config.ENV === 'production' ? 10000 : null, withCredentials: true };

	constructor(private $http: IHttpService, private logger: NgLogger) {}

	public async Get<T = any>(url: string, defaultReturn: T = null) {
		const baseGetOptions = { params: { timestamp: (isIE11() ? Date.now() : null) } };
		const options = Object.assign(baseGetOptions, this.baseOptions);
		const promise = this.$http.get<T>(this.prefix + url, options);
		return this.safeAwait(promise, defaultReturn);
	}

	public async Post<T = any>(url: string, data: any = null) {
		const promise = this.$http.post<T>(this.prefix + url, data, this.baseOptions);
		return this.safeAwait(promise);
	}

	private async safeAwait<T>(promise: IHttpPromise<T>, defaultReturn: T = null) {
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
				this.logger.devWarning(`Route '${err.config.url}' not found`);
				break;
			case 500:
				const { data, statusText } = err;
				this.logger.error(typeof data === 'string' && data.length > 0 ? data : statusText);
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
				this.logger.warning(err.statusText);
				break;
			case -1:
				this.logger.warning('Server timed out.');
				break;
			default:
				this.logger.devWarning(`An unregistered error occurred for '${err.config.url}' (code: ${err.status})`);
				break;
		}
	}
}
