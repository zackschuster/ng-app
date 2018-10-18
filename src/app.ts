// tslint:disable:max-classes-per-file
import { bootstrap, copy, injector, module } from 'angular';
import { StateProvider } from '@uirouter/angularjs';
import { HookMatchCriteria, TargetState, Transition, TransitionService } from '@uirouter/core';
import { Callback, IConfig } from '@ledge/types';
import { autobind } from 'core-decorators';

import { NgDataService } from './http';
import { NgLogger } from './logger';
import { NgModalService } from './modal';
import { NgRouter, NgStateService } from './router';

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

export interface NgConfig extends IConfig {
	readonly IS_PROD: boolean;
	readonly IS_DEV: boolean;
	readonly IS_STAGING: boolean;
}

@autobind
export class NgApp {

	public get components() {
		return Array.from(this.$components.keys());
	}

	public get module() {
		return this.$module;
	}

	public get config() {
		return copy(this.$config);
	}

	public set config(ngConfig: Partial<NgConfig>) {
		const env = process.env.NODE_ENV;
		this.$config = Object.assign(ngConfig, {
			ENV: env,
			IS_PROD: env === 'production',
			IS_DEV: env === 'development',
			IS_STAGING: env === 'staging',
		} as NgConfig);
	}
	public readonly $id = '$core';
	public $injector = injector(['ng']);
	protected router: NgRouter;

	private $dependencies = [
		'ngAnimate',
		'ngMessages',
		'ui.bootstrap',
		'ui.router',
		'monospaced.elastic',
	];

	private $config: NgConfig;

	private readonly $module = module(this.$id, this.$dependencies);
	private readonly $bootstrap = bootstrap;

	private readonly $components: Map<string, angular.IComponentOptions> = new Map();

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
					const { IS_DEV, IS_STAGING } = this.$config;

					$compileProvider
						.debugInfoEnabled(!!(IS_DEV || IS_STAGING))
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

	public bootstrap({ strictDi }: angular.IAngularBootstrapConfig = { strictDi: true }) {
		if (this.router == null) {
			return this.logger().devWarning('app.registerRouter(ngRouter) must be run before bootstrap');
		}

		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}

		this.$module.config(['$stateProvider', ($stateProvider: StateProvider) => {
			for (const definition of this.router.getRoutes()) {
				$stateProvider.state(definition);
			}
		}]);

		setTimeout(() => document.body.classList.add('bootstrapped'));
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

	public registerRouter(router: NgRouter) {
		this.router = router;
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
		timeout: this.$config.IS_PROD ? 10000 : undefined,
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
		return new NgLogger(this.$injector.get('$log'), this.$config.IS_PROD);
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
		const { IS_PROD, IS_DEV, IS_STAGING } = this.$config;

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
				public $state: NgStateService,
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
