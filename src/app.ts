// tslint:disable:max-classes-per-file
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
import 'element-closest';

type TransitionHooks =
	'onBefore' |
	'onEnter' |
	'onError' |
	'onExit' |
	'onFinish' |
	'onRetain' |
	'onStart' |
	'onSuccess';

@autobind
export class NgApp {
	public readonly $id = '$core';
	public $injector = injector(['ng']);

	private $dependencies = [
		'ngAnimate',
		'ngMessages',
		'ui.bootstrap',
		'ui.router',
		'monospaced.elastic',
	];

	private $config: IConfig;
	private $flags: { IS_PROD: boolean; IS_DEV: boolean; IS_STAGING: boolean };

	private readonly $module = module(this.$id, this.$dependencies);
	private readonly $bootstrap = bootstrap;

	private readonly $components: Map<string, angular.IComponentOptions> = new Map();
	private $routes: Ng1StateDeclaration[] = [];

	constructor() {
		this.config = {};

		this.$module
			.config([
				'$compileProvider', '$locationProvider', '$qProvider',
				(
					$compileProvider: angular.ICompileProvider,
					$locationProvider: angular.ILocationProvider,
					$qProvider: angular.IQProvider,
				) => {
					const { IS_DEV, IS_STAGING } = this.$flags;

					$compileProvider
						.debugInfoEnabled(IS_DEV || IS_STAGING)
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
						const template = $templateCache.get<string>(templateUrl);
						if (template != null) {
							$templateCache.put(templateUrl, template.replace(/glyphicon/g, 'fa'));
						}
					});

					this.$injector = $injector;
					$animate.enabled(true);
				}]);
	}

	public get components() {
		return Array.from(this.$components.keys());
	}

	public get module() {
		return this.$module;
	}

	public get config() {
		return this.$config;
	}

	public set config(cfg: IConfig) {
		this.$config = cfg;
		this.$config.ENV = process.env.NODE_ENV;
		this.$flags = {
			IS_PROD: this.$config.ENV === 'production',
			IS_DEV: this.$config.ENV === 'development',
			IS_STAGING: this.$config.ENV === 'staging',
		};
	}

	public bootstrap({ strictDi }: angular.IAngularBootstrapConfig = { strictDi: true }) {
		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}

		this.$module.config(['$stateProvider', ($stateProvider: StateProvider) => {
			for (const definition of this.$routes) {
				$stateProvider.state(definition);
			}
		}]);

		this.$bootstrap(document.body, [this.$id], { strictDi });
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
		timeout: this.$flags.IS_PROD ? 10000 : undefined,
		withCredentials: true,
	}) {
		return new NgDataService(
			this.$injector.get('$http'),
			this.timeout(),
			this.logger(),
			this._verifyApiPrefix(),
			options,
		);
	}

	public logger() {
		return new NgLogger(this.$injector.get('$log'), this.$flags.IS_PROD);
	}

	public modal() {
		return new NgModalService(
			this.$injector.get('$uibModal'),
			this.timeout(),
			this.http(),
			this.logger(),
		);
	}

	public timeout() {
		return this.$injector.get('$timeout');
	}

	public _wrapComponentController($controller: new(...args: any[]) => angular.IController) {
		const { config, http, logger, _verifyApiPrefix: getApiPrefix } = this;
		const { IS_PROD, IS_DEV, IS_STAGING } = this.$flags;

		// Force `this` to always refer to the class instance, no matter what
		autobind($controller);

		class InternalController extends $controller {
			public $log = logger();
			public $http = http();
			public $config = config;
			public $element: HTMLElement;

			public isProduction = IS_PROD;
			public isDevelopment = IS_DEV;
			public isStaging = IS_STAGING;
			public apiPrefix = getApiPrefix();

			constructor(
				$element: JQLite,
				public $scope: angular.IScope,
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
			'$element', '$scope', '$attrs', '$timeout', '$injector', '$state',
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
