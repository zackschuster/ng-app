// tslint:disable-next-line:max-line-length
import { IAttributes, ICompileProvider, IComponentOptions, IController, ILocationProvider, IPromise, IQProvider, IQService, IRootElementService, IScope, ITemplateCacheService, ITimeoutService, Injectable, animate, auto, bootstrap, injector, module, IHttpProvider, IHttpInterceptorFactory } from 'angular';
import { IState, IStateProvider, IStateService } from 'angular-ui-router';
import { HookMatchCriteria, TargetState, Transition, TransitionService } from '@uirouter/core';
import { IConfig } from '@ledge/types';

import { NgDataService } from './http';
import { NgLogger } from './logger';
import { NgModalService } from './modal';
import { NgRenderer } from './renderer';

import { InputComponentOptions } from '..';
import { InputService } from './input/service';

import 'angular-animate';
import 'angular-messages';
import 'angular-elastic';
import 'angular-ui-bootstrap';

import '@uirouter/angularjs';

// tslint:disable-next-line:max-line-length
type TransitionHooks = 'onBefore' | 'onEnter' | 'onError' | 'onExit' | 'onFinish' | 'onRetain' | 'onStart' | 'onSuccess';

export class NgApp {
	public $injector = injector(['ng']);

	private readonly $id: string = '$core';
	private readonly $dependencies = [
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
	private $routes: IState[] = [];

	constructor() {
		this.$module
			.config([
				'$compileProvider', '$locationProvider', '$qProvider',
				($compileProvider: ICompileProvider, $locationProvider: ILocationProvider, $qProvider: IQProvider) => {
					$compileProvider
						.commentDirectivesEnabled(false)
						.cssClassDirectivesEnabled(false);

					$locationProvider.html5Mode(true);
					$qProvider.errorOnUnhandledRejections(false);
			}])
			.run([
				'$injector', '$animate', '$templateCache',
				($injector: auto.IInjectorService, $animate: animate.IAnimateService, $templateCache: ITemplateCacheService) => {
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

		this.$module.config(['$stateProvider', ($stateProvider: IStateProvider) => {
			for (const definition of this.$routes) {
				$stateProvider.state(definition);
			}
		}]);

		this.$bootstrap(document.body, [this.$id]);
	}

	// tslint:disable-next-line:ban-types
	public run(block: Injectable<Function>) {
		this.$module.run(block);
		return this;
	}

	public registerRoutes(routes: IState[]) {
		this.$routes = [
			...(this.$routes), /*parens for syntax highlighting*/
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

	public registerHttpInterceptor(interceptor: Injectable<IHttpInterceptorFactory>) {
		this.$module.config(['$httpProvider', ($httpProvider: IHttpProvider) => {
			$httpProvider.interceptors.push(interceptor);
		}]);
		return this;
	}

	public registerComponents(components: Map<string, IComponentOptions> | { [index: string]: IComponentOptions }) {
		const logger = this.logger();

		const componentIterable = components instanceof Map
			? Array.from(components)
			: Object.entries(components);

		// tslint:disable-next-line:prefer-const
		for (let [name, component] of componentIterable) {
			if ((component as InputComponentOptions).type === 'input') {
				component = InputService.defineInputComponent(component as InputComponentOptions);
			}

			if (component.controller != null) {
				const $controller = component.controller as new(...args: any[]) => IController;

				// tslint:disable-next-line:max-classes-per-file
				class InternalController extends $controller {
					public $log = logger;
					public $http: NgDataService;
					public $promise: IQService;
					public $resolve: <T>(value: T | IPromise<T>) => IPromise<T>;

					constructor(
						public $scope: IScope,
						public $element: IRootElementService,
						public $attrs: IAttributes,
						public $timeout: ITimeoutService,
						public $injector: auto.IInjectorService,
						public $state: IStateService,

						$q: IQService,
					) {
						super();

						this.$http = new NgDataService(
							this.$injector.get('$http'),
							this.$log,
						);

						this.$promise = $q;
						this.$resolve = $q.resolve;
					}
				}

				// tslint:disable-next-line:only-arrow-functions
				component.controller = [
					'$scope', '$element', '$attrs', '$timeout', '$injector', '$state', '$q',
					InternalController,
				];
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public renderer() {
		return new NgRenderer(document);
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

	public scope() {
		return this.$injector.get('$rootScope').$new();
	}

	public compiler() {
		return this.$injector.get('$compile');
	}

	public root() {
		return this.$injector.get('$rootElement');
	}
	public timeout() {
		return this.$injector.get('$timeout');
	}
}
