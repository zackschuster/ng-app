import { bootstrap, injector, module } from 'angular';
import { Ng1StateDeclaration, StateProvider } from '@uirouter/angularjs';
import { HookMatchCriteria, StateService, TargetState, Transition, TransitionService } from '@uirouter/core';
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

	private readonly $id = '$core';
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

	private $components: Map<string, angular.IComponentOptions> = new Map();
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
					$injector: angular.auto.IInjectorService,
					$animate: angular.animate.IAnimateService,
					$templateCache: angular.ITemplateCacheService,
				) => {
					['day', 'month', 'year'].forEach(x => {
						const templateUrl = `uib/template/datepicker/${x}.html`;
						const template = $templateCache.get<string>(templateUrl).replace(/glyphicon/g, 'fa');
						$templateCache.put(templateUrl, template);
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

	public registerComponents(
		components: Map<string, angular.IComponentOptions> | { [index: string]: angular.IComponentOptions },
	) {
		const componentIterable = components instanceof Map
			? Array.from(components)
			: Object.entries(components);

		for (let [name, component] of componentIterable) {
			if ((component as InputComponentOptions).type === 'input') {
				component = InputService.defineInputComponent(component as InputComponentOptions);
			}

			if (typeof component.controller === 'string') {
				throw new Error('String controller references not supported');
			}

			if (component.controller != null) {
				component.controller = this._wrapComponentController(component.controller as new() => any);
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public http(options: angular.IRequestShortcutConfig = {
		timeout: this.$config.ENV === 'production' ? 10000 : undefined,
		withCredentials: true,
	}) {
		return new NgDataService(
			this.$injector.get('$http'),
			this.logger(),
			this._verifyApiPrefix(),
			options,
		);
	}

	public logger() {
		return new NgLogger(this.$injector.get('$log'), this.$config.ENV === 'production');
	}

	public modal() {
		return new NgModalService(this.$injector.get('$uibModal'), this);
	}

	public timeout() {
		return this.$injector.get('$timeout');
	}

	public _wrapComponentController($controller: new(...args: any[]) => angular.IController) {
		const config = this.$config;

		const logger = this.logger();
		const http = this.http();
		const apiPrefix = this._verifyApiPrefix(config);

		// Force `this` to always refer to the class instance, no matter what
		autobind($controller);

		// tslint:disable-next-line:max-classes-per-file
		class InternalController extends $controller {
			public $log = logger;
			public $http = http;
			public $config = config;
			public $element: HTMLElement;

			public isProduction = config.ENV === 'production';
			public isDevelopment = config.ENV === 'development';
			public isStaging = config.ENV === 'staging';
			public apiPrefix = apiPrefix;

			constructor(
				public $scope: angular.IScope,
				$element: JQLite,
				public $attrs: angular.IAttributes,
				public $timeout: angular.ITimeoutService,
				public $injector: angular.auto.IInjectorService,
				public $state: StateService,
			) {
				super();

				this.$element = $element[0];
			}
		}

		return [
			'$scope', '$element', '$attrs', '$timeout', '$injector', '$state', '$http',
			InternalController,
		];
	}

	protected _verifyApiPrefix(config = this.$config) {
		if (config.PREFIX == null || config.PREFIX.toString() !== '[object Object]') {
			throw new Error('Error creating http service: PREFIX config not properly set');
		}

		if (typeof config.PREFIX.API !== 'string') {
			throw new Error('Error creating http service: API prefix must be a string');
		}

		return config.PREFIX.API;
	}
}
