import { IHttpPromiseCallbackArg, IHttpService, IQService, ITimeoutService } from 'angular';
import { StateService } from 'angular-ui-router';
import { config } from 'app/core/config';
import { Logger } from 'app/core/logger';

export class DataService {
	private prefix: string;
	private baseOptions = { timeout: 10000 };

	/* @ngInject */
	constructor(
		private $q: IQService,
		private $http: IHttpService,
		private $timeout: ITimeoutService,
		private $state: StateService,
		private logger: Logger,
	) {
		// tslint:disable-next-line:curly
		if (config.PREFIX == null) return;

		this.prefix = config.PREFIX.API as string;
	}

	public Get(url: string) {
		return this.$http
			.get(this.prefix + url, this.baseOptions)
			.then(rsp => this.onSuccess(rsp))
			.catch(err => this.onError(err));
	}

	public Post(url: string, data: any) {
		const options = Object.assign({ data, params: { timestamp: Date.now() } }, this.baseOptions);

		return this.$http
			.post(this.prefix + url, options)
			.then(rsp => this.onSuccess(rsp))
			.catch(err => this.onError(err));
	}

	private onSuccess(rsp: IHttpPromiseCallbackArg<{}>) {
		// only need the data
		return rsp.data;
	}

	private onError(err: IHttpPromiseCallbackArg<{}>) {
		this.$timeout(_ => this.checkAuthError(err.status as number, err.data), 300);

		// send full object to caller with $q.reject
		return this.$q.reject(err);
	}

	private checkAuthError(status: number, err: any) {
		if (status === 401) {
			this.logger.warning('You must be logged in to access this page');
			this.$state.go('login');
			return;
		}

		this.logger.error(err.ExceptionMessage || err.Message);
	}
}
