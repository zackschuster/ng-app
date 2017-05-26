// tslint:disable-next-line:max-line-length
import { ICompileService, IHttpService, ILogService, IModule, IQService, IRootScopeService, ITimeoutService, auto, injector } from 'angular';

export class Ng {
	private $injector: auto.IInjectorService;
	private $module: IModule;

	constructor($module: IModule) {
		this.$module = $module;

		$module.run(['$injector', ($injector: auto.IInjectorService) => {
			this.$injector = $injector;
		}]);
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
		return (this.$injector || injector(['ng'])).get<T>(service);
	}
}
