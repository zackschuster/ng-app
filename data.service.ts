import { IHttpPromiseCallbackArg, IHttpService, ITimeoutService } from 'angular';
import { StateService } from 'angular-ui-router';
import { config } from 'app/core/config';
import { Logger } from 'app/core/logger';

export class DataService {
	private prefix = (config.PREFIX as { API: string }).API;
	private baseOptions = { timeout: 10000 };

	/* @ngInject */
	constructor(
		private $http: IHttpService,
		private $timeout: ITimeoutService,
		private $state: StateService,
		private logger: Logger,
	) { }

	public async Get<T = any>(url: string) {
		const options = Object.assign({ params: { timestamp: Date.now() } }, this.baseOptions);

		try {
			const rsp = await this.$http.get(this.prefix + url, options) as IHttpPromiseCallbackArg<{}>;
			return rsp.data as T;
		} catch (err) {
			throw this.onError(err);
		}
	}

	public async Post<T = any>(url: string, data: T) {
		try {
			const rsp = await this.$http.post(this.prefix + url, data, this.baseOptions) as IHttpPromiseCallbackArg<{}>;
			return rsp.data as any;
		} catch (err) {
			throw this.onError(err);
		}
	}

	private onError(err: IHttpPromiseCallbackArg<{}>) {
		this.$timeout(_ => this.checkAuthError(err.status), 300);
		return err;
	}

	private checkAuthError(status: number) {
		switch (status) {
			case 401:
				this.logger.warning('You must be logged in to access this page');
				this.$state.go('login');
				return;
			case 500:
				this.logger.error('Internal server error. Please try again.');
				return;
		}
	}
}
