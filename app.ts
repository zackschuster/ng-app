// tslint:disable-next-line:max-line-length
import { ICompileProvider, ICompileService, IComponentOptions, IHttpService, ILogService, IQService, IRootScopeService, ITimeoutService, auto, bootstrap, injector, module } from 'angular';
import { IConfig } from '@ledge/types';

import 'angular-animate';
import 'angular-elastic';
import 'angular-ui-bootstrap';

export class App {
	public readonly config: IConfig = {
		NAME: 'ElevateCA Admin',
		VERSION: '1.0.0',
		PREFIX: {
			API: 'http://localhost:5000/api/',
		},
		ENV: process.env.NODE_ENV,
	};

	private $id: string = 'core';
	private $dependencies = [
		'ngAnimate',
		'ui.bootstrap',
		'monospaced.elastic',
	];

	private $module = module(this.$id, this.$dependencies);
	private $injector = injector(['ng']);
	private $bootstrap = bootstrap;

	private $components: Map<string, IComponentOptions> = new Map();

	constructor() {
		this.$module
			.config(['$compileProvider', ($compileProvider: ICompileProvider) => {
				$compileProvider
					.commentDirectivesEnabled(false)
					.cssClassDirectivesEnabled(false);
			}])
			.run(['$injector', ($injector: auto.IInjectorService) => {
				this.$injector = $injector;
			}]);
	}

	public bootstrap() {
		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}

		this.$bootstrap(document, [this.$id]);
	}

	public name() {
		return this.$module.name;
	}

	public component(name: string, definition: IComponentOptions) {
		this.$components.set(name, definition);
		return this;
	}

	public addComponents(components: { [name: string]: IComponentOptions }) {
		const names = Object.keys(components);

		for (const name of names) {
			this.$components.set(name, components[name]);
		}

		return this;
	}

	public getComponent(name: string) {
		return this.$components.get(name);
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
