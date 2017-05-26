// tslint:disable-next-line:max-line-length
import { ICompileService, IHttpService, ILogService, IQService, IRootScopeService, ITimeoutService, auto, injector } from 'angular';

class Ng {
	private $injector: auto.IInjectorService;

	constructor() {
		this.$injector = injector(['ng']);
	}

	public compiler() {
		return this.ngGet<ICompileService>('$compile');
	}

	public http() {
		return this.ngGet<IHttpService>('$http');
	}

	public logger() {
		return this.ngGet<ILogService>('$log');
	}

	public q() {
		return this.ngGet<IQService>('$q');
	}

	public scope() {
		return this.ngGet<IRootScopeService>('$rootScope').$new();
	}

	public timeout() {
		return this.ngGet<ITimeoutService>('$timeout');
	}

	private ngGet<T>(service: string) {
		return this.$injector.get<T>(service);
	}
}

export const ng = new Ng();
