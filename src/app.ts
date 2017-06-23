// tslint:disable-next-line:max-line-length
import { ICompileProvider, IComponentOptions, ILocationProvider, animate, auto, bootstrap, injector, module, route } from 'angular';
import { IConfig } from '@ledge/types';

import { NgDataService } from './http';
import { NgLogger } from './logger';
import { NgModalService } from './modal';
import { NgRenderer } from './renderer';

import { InputComponentOptions } from '../types';
import { InputService } from './input/service';

import 'angular-animate';
import 'angular-route';
import 'angular-elastic';
import 'angular-ui-bootstrap';
import 'ui-select';

export class NgApp {
	private readonly $id: string = '$core';
	private readonly $dependencies = [
		'ngAnimate',
		'ngRoute',
		'ui.bootstrap',
		'ui.select',
		'monospaced.elastic',
	];

	private $config: IConfig = { ENV: process.env.NODE_ENV };

	private $module = module(this.$id, this.$dependencies);
	private $injector = injector(['ng']);
	private $bootstrap = bootstrap;

	private $components: Map<string, IComponentOptions> = new Map();
	private $routes: Map<string, route.IRoute> = new Map();

	constructor() {
		this.$module
			.config([
				'$compileProvider', '$locationProvider',
				($compileProvider: ICompileProvider, $locationProvider: ILocationProvider) => {
					$compileProvider
						.commentDirectivesEnabled(false)
						.cssClassDirectivesEnabled(false);

					$locationProvider.html5Mode(true);
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

	public set config(cfg: IConfig) {
		this.$config = cfg;
		this.$config.ENV = process.env.NODE_ENV;

		if (this.$config.PREFIX == null) {
			this.$config.PREFIX = { API: '' };
		} else if (!this.$config.PREFIX.API) {
			this.$config.PREFIX.API = '';
		}
	}

	public bootstrap() {
		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}

		this.$module.config(['$routeProvider', ($routeProvider: route.IRouteProvider) => {
			for (const [name, definition] of this.$routes) {
				$routeProvider.when(name, definition);
			}
		}]);

		this.$bootstrap(document.body, [this.$id]);
	}

	public registerRoutes(routes: Map<string, route.IRoute>) {
		this.$routes = new Map([...this.$routes, ...routes]);
		return this;
	}

	public registerComponents(components: Map<string, IComponentOptions>) {
		for (let [name, component] of components) {
			if ((component as InputComponentOptions).type === 'input') {
				component = InputService.defineInputComponent(component as InputComponentOptions);
			}
			this.$components.set(name, component);
		}

		return this;
	}

	public compiler() {
		return this.$injector.get('$compile');
	}

	public modal() {
		return new NgModalService(this.$injector.get('$uibModal'));
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
}
