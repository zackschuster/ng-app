import { IComponentOptions, IController, ITimeoutService, auto, bootstrap, injector, module } from 'angular';
import { Ng1StateDeclaration, StateProvider, StateService } from '@uirouter/angularjs';
import { HookMatchCriteria, TargetState, Transition, TransitionService } from '@uirouter/core';
import { Callback, IConfig } from '@ledge/types';
import { autobind } from 'core-decorators';

import { NgDataService } from './http';
import { NgLogger } from './logger';
import { NgModalService } from './modal';

import { InputComponentOptions } from './input/options';
import { InputService } from './input/service';

import 'angular-animate';
import 'angular-messages';
import 'angular-elastic';
import 'angular-ui-bootstrap';

import '@uirouter/angularjs';

type TransitionHooks =
	'onBefore' |
	'onEnter' |
	'onError' |
	'onExit' |
	'onFinish' |
	'onRetain' |
	'onStart' |
	'onSuccess';

export class NgApp {
	public $injector = injector(['ng']);

	private readonly $id: string = '$core';
	private $dependencies = [
		'ngAnimate',
		'ngMessages',
		'ui.bootstrap',
		'ui.router',
		'monospaced.elastic',
	];

	private $config: IConfig = { ENV: process.env.NODE_ENV };

	private $module = module(this.$id, this.$dependencies);
	private $bootstrap = bootstrap;

	private $components: Map<string, IComponentOptions> = new Map();
	private $routes: Ng1StateDeclaration[] = [];

	constructor() {
		this.$module
			.config([
				'$compileProvider', '$locationProvider', '$qProvider',
				(
					$compileProvider: angular.ICompileProvider,
					$locationProvider: angular.ILocationProvider,
					$qProvider: angular.IQProvider,
				) => {
					$compileProvider
						.commentDirectivesEnabled(false)
						.cssClassDirectivesEnabled(false);

					$locationProvider.html5Mode(true);
					$qProvider.errorOnUnhandledRejections(false);
			}])
			.run([
				'$injector', '$animate', '$templateCache',
				(
					$injector: auto.IInjectorService,
					$animate: angular.animate.IAnimateService,
					$templateCache: angular.ITemplateCacheService,
				) => {
					['day', 'month', 'year'].forEach(x => {
						const tplName = `uib/template/datepicker/${x}.html`;
						const tpl = $templateCache.get<string>(tplName).replace(/glyphicon/g, 'fa');
						$templateCache.put(tplName, tpl);
					});

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

		this.$module.config(['$stateProvider', ($stateProvider: StateProvider) => {
			for (const definition of this.$routes) {
				$stateProvider.state(definition);
			}
		}]);

		this.$bootstrap(document.body, [this.$id]);
	}

	public registerConfigBlock(inlineAnnotatedFunction: (string | Callback)[]) {
		this.$module.config(inlineAnnotatedFunction);
		return this;
	}

	public registerRunBlock(inlineAnnotatedFunction: (string | Callback)[]) {
		this.$module.run(inlineAnnotatedFunction);
		return this;
	}

	public registerDependency(moduleName: string) {
		this.$dependencies.push(moduleName);
		return this;
	}

	public registerDependencies(moduleNames: string[]) {
		moduleNames.forEach(moduleName => this.registerDependency(moduleName));
		return this;
	}

	public registerRoutes(routes: Ng1StateDeclaration[]) {
		this.$routes = [
			...this.$routes,
			...routes,
		];
		return this;
	}

	public registerTransitionHook(
		hook: TransitionHooks,
		criteria: HookMatchCriteria,
		cb: (trans: Transition) => boolean | TargetState | Promise<boolean | TargetState>,
	) {
		this.$module.run(['$transitions', (transitions: TransitionService) => {
			(transitions as any)[hook](criteria, cb);
		}]);
		return this;
	}

	public registerHttpInterceptor(interceptor: angular.Injectable<angular.IHttpInterceptorFactory>) {
		this.$module.config(['$httpProvider', ($httpProvider: angular.IHttpProvider) => {
			$httpProvider.interceptors.push(interceptor);
		}]);
		return this;
	}

	public registerComponents(components: Map<string, IComponentOptions> | { [index: string]: IComponentOptions }) {
		const logger = this.logger();
		const config = this.$config;

		const componentIterable = components instanceof Map
			? Array.from(components)
			: Object.entries(components);

		for (let [name, component] of componentIterable) {
			if ((component as InputComponentOptions).type === 'input') {
				component = InputService.defineInputComponent(component as InputComponentOptions);
			}

			if (component.controller != null) {
				const $controller = component.controller as new(...args: any[]) => IController;

				// Force `this` to always refer to the class instance, no matter what
				autobind($controller);

				// tslint:disable-next-line:max-classes-per-file
				class InternalController extends $controller {
					public $log = logger;
					public $http: NgDataService;

					public isProduction: boolean;
					public isDevelopment: boolean;
					public isStaging: boolean;

					constructor(
						public $scope: angular.IScope,
						$element: JQuery,
						public $attrs: angular.IAttributes,
						public $timeout: ITimeoutService,
						public $injector: auto.IInjectorService,
						public $state: StateService,
						$http: angular.IHttpService,
					) {
						super();

						this.$http = new NgDataService($http, this.$log);
						this.$element = ($element as any)[0];

						this.$config = config;
						this.isProduction = this.$config.ENV === 'production';
						this.isDevelopment = this.$config.ENV === 'development';
						this.isStaging = this.$config.ENV === 'staging';
					}
				}

				component.controller = [
					'$scope', '$element', '$attrs', '$timeout', '$injector', '$state', '$http',
					InternalController,
				];
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public http() {
		return new NgDataService(this.$injector.get('$http'), this.logger());
	}

	public logger() {
		return new NgLogger(this.$injector.get('$log'));
	}

	public modal() {
		return new NgModalService(this.$injector.get('$uibModal'), this);
	}

	public timeout() {
		return this.$injector.get('$timeout');
	}
}
