// tslint:disable-next-line:max-line-length
import { ICompileProvider, ICompileService, IComponentOptions, IHttpService, ILogService, IQService, IRootScopeService, ITimeoutService, auto, bootstrap, injector, module } from 'angular';
import { CacheFactory } from 'cachefactory';
import { IConfig } from '@ledge/types';

import { DataService } from 'core/data/service';
import { Logger } from 'core/log/service';

import 'angular-animate';
import 'angular-elastic';
import 'angular-ui-bootstrap';

export class App {
	private readonly $config: IConfig = {
		NAME: 'ElevateCA Admin',
		VERSION: '1.0.0',
		PREFIX: {
			API: 'http://localhost:5000/api/',
		},
		ENV: process.env.NODE_ENV,
	};

	private $id: string = '$core';
	private $dependencies = [
		'ngAnimate',
		'ui.bootstrap',
		'monospaced.elastic',
	];

	private $module = module(this.$id, this.$dependencies);
	private $injector = injector(['ng']);
	private $bootstrap = bootstrap;
	private $cache = new CacheFactory().createCache(this.$id, {
		maxAge: 60 * 1000,
		deleteOnExpire: 'aggressive',
	});

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

	public config() {
		return this.$config;
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

	public cache() {
		return this.$cache;
	}

	public compiler() {
		return this.ngGet<ICompileService>('$compile');
	}

	public http() {
		const $http = this.ngGet<IHttpService>('$http');
		return new DataService($http, this.logger());
	}

	public logger() {
		const $log = this.ngGet<ILogService>('$log');
		return new Logger($log);
	}

	public q() {
		return this.ngGet<IQService>('$q');
	}

	public scope() {
		const $rootScope = this.ngGet<IRootScopeService>('$rootScope');
		return $rootScope.$new();
	}

	public timeout() {
		return this.ngGet<ITimeoutService>('$timeout');
	}

	protected ngGet<T>(service: string) {
		return this.$injector.get<T>(service);
	}
}
