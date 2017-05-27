import { IHttpPromiseCallbackArg, IHttpService } from 'angular';

import { config } from 'core';
import { Logger } from 'core/log/service';

export class DataService {
	private prefix = (config.PREFIX as { API: string }).API;
	private baseOptions = { timeout: config.ENV === 'production' ? 10000 : null };

	/* @ngInject */
	constructor(private $http: IHttpService, private logger: Logger) {
	}

	public async Get<T = any>(url: string, defaultReturn: T = null) {
		const options = Object.assign({ params: { timestamp: Date.now() } }, this.baseOptions);
		const promise = this.$http.get(this.prefix + url, options);
		return this.safeAwait<T>(promise, defaultReturn);
	}

	public async Post<T = any>(url: string, data: T = null) {
		const promise = this.$http.post(this.prefix + url, data, this.baseOptions);
		return this.safeAwait<T>(promise);
	}

	private async safeAwait<T = any>(promise: PromiseLike<T>, defaultReturn: T = null) {
		try {
			const rsp = await promise as IHttpPromiseCallbackArg<{}>;
			return rsp == null ? defaultReturn : rsp.data as T;
		} catch (err) {
			this.onError(err);
			return defaultReturn;
		}
	}

	private onError(err: IHttpPromiseCallbackArg<{}>) {
		switch (err.status) {
			case 401:
				this.logger.warning('You must be logged in to access this page');
				break;
			case 404:
				this.logger.devWarning(`Route '${err.config.url}' not found`);
				break;
			case 500:
				this.logger.error('Internal server error. Please try again.');
				break;
			default:
				this.logger.devWarning(`An unknown error occurred for '${err.config.url}'`);
				break;
		}
		return err;
	}
}
