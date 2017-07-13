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
		const promise: IHttpPromise<T> = this.$http.get(this.prefix + url, options);
		return this.safeAwait<T>(promise, defaultReturn);
	}

	public async Post<T = any>(url: string, data: T = null) {
		const promise: IHttpPromise<T> = this.$http.post(this.prefix + url, data, this.baseOptions);
		return this.safeAwait<T>(promise);
	}

	private async safeAwait<T = any>(promise: IHttpPromise<T>, defaultReturn: T = null) {
		try {
			const rsp = await promise as IHttpPromiseCallbackArg<{}>;
			return rsp == null ? defaultReturn : rsp.data as T;
		} catch (err) {
			this.onError(err);
			throw err;
		}
	}

	private onError(err: IHttpPromiseCallbackArg<{}>) {
		switch (err.status) {
			case 404:
				this.logger.devWarning(`Route '${err.config.url}' not found`);
				break;
			case 500:
				const { data, statusText } = err;
				this.logger.error(typeof data === 'string' && data.length > 0 ? data : statusText);
				break;
			case 401:
				this.logger.warning('You must be logged in to access this page');
				break;
			case -1:
				this.logger.warning('Server is inaccessible.');
				break;
			default:
				this.logger.devWarning(`An unregistered error occurred for '${err.config.url}' (code: ${err.status})`);
				break;
		}
	}
}
