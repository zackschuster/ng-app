// tslint:disable-next-line:max-line-length
import { ICompileProvider, IComponentOptions, animate, auto, bootstrap, injector, module } from 'angular';
import { CacheFactory, CacheOptions } from 'cachefactory';
import { IConfig } from '@ledge/types';

import { IApp } from 'core/models';
import { NgDataService } from 'core/ng/http';
import { NgLogger } from 'core/ng/logger';
import { NgRenderer } from 'core/ng/renderer';

import 'angular-animate';
import 'angular-elastic';
import 'angular-ui-bootstrap';

export class NgApp implements IApp {
	private readonly $id: string = '$core';
	private readonly $dependencies = [
		'ngAnimate',
		'ui.bootstrap',
		'monospaced.elastic',
	];

	private $config: IConfig = {
		NAME: 'ElevateCA Admin',
		VERSION: '1.0.0',
		PREFIX: {
			API: 'http://localhost:5000/api/',
		},
		ENV: process.env.NODE_ENV,
	};

	private $module = module(this.$id, this.$dependencies);
	private $injector = injector(['ng']);
	private $bootstrap = bootstrap;
	private $cacheFactory = new CacheFactory();

	private $components: Map<string, IComponentOptions> = new Map();

	constructor() {
		this.$module
			.config(['$compileProvider', ($compileProvider: ICompileProvider) => {
				$compileProvider
					.commentDirectivesEnabled(false)
					.cssClassDirectivesEnabled(false);
			}])
			.run(['$injector', '$animate', ($injector: auto.IInjectorService, $animate: animate.IAnimateService) => {
				this.$injector = $injector;
				$animate.enabled(true);
			}]);
	}

	public get name() {
		return this.$module.name;
	}

	public get config() {
		return this.$config;
	}

	public cache(options: CacheOptions = { maxAge: 60000, deleteOnExpire: 'aggressive' }) {
		return this.$cacheFactory.exists(this.$id)
			? this.$cacheFactory.get(this.$id)
			: this.$cacheFactory.createCache(this.$id, options);
	}

	public bootstrap() {
		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}

		this.$bootstrap(document.body, [this.$id]);
	}

	public registerComponents(components: { [name: string]: IComponentOptions }) {
		const names = Object.keys(components);

		for (const name of names) {
			this.component(name, components[name]);
		}

		return this;
	}

	public compiler() {
		return this.$injector.get('$compile');
	}

	public http() {
		const $http = this.$injector.get('$http');
		return new NgDataService($http, this.logger());
	}

	public logger() {
		const $log = this.$injector.get('$log');
		return new NgLogger($log);
	}

	public root() {
		return this.$injector.get('$rootElement');
	}

	public renderer() {
		return new NgRenderer();
	}

	public scope() {
		const $rootScope = this.$injector.get('$rootScope');
		return $rootScope.$new();
	}

	public timeout() {
		return this.$injector.get('$timeout');
	}

	private component(name: string, definition: IComponentOptions) {
		this.$components.set(name, definition);
		return this;
	}
}
