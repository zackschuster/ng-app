import { Indexed } from '@ledge/types';
import { StateService } from '@uirouter/core';
import { StateProvider } from '@uirouter/angularjs';
import { autobind } from 'core-decorators';

import { Injector } from '@angular/core';

import { NgController, makeNg1Controller } from './controller';
import { NgHttp, NgHttpInterceptor, NgHttpOptions } from './http';
import { NgInputFactory, NgInputOptions } from './inputs';
import { NgConsole, NgLogger } from './logger';
import { NgModal } from './modal';
import { NgInjector, bootstrap, injector, module } from './ng';
import { NgAppConfig, NgComponentOptions } from './options';
import { NgRenderer } from './renderer';
import { NgRouter } from './router';
import { NgService } from './service';

@autobind
export class NgApp extends NgService {
	public get module() {
		return this.$module;
	}

	public get router() {
		return this.$router;
	}

	public get components() {
		return new Set(this.$components.keys());
	}

	public get dependencies() {
		return new Set(this.$dependencies);
	}

	public get state() {
		return this.$injector.get<StateService>('$state');
	}

	public get config() {
		return this.$injector2.get<NgAppConfig>(NgAppConfig);
	}

	public get http() {
		return this.$injector2.get<NgHttp>(NgHttp);
	}

	public get console() {
		return this.$injector2.get<NgConsole>(NgConsole);
	}

	public get log() {
		return this.$injector2.get<NgLogger>(NgLogger);
	}

	public get modal() {
		return this.$injector2.get<NgModal>(NgModal);
	}

	public get renderer() {
		return this.$injector2.get<NgRenderer>(NgRenderer);
	}

	public get inputs() {
		return this.$injector2.get<NgInputFactory>(NgInputFactory);
	}

	public readonly $id = '$core';
	public readonly $injector = injector(['ng']);
	public readonly $injector2 = Injector.create({
		name: this.$id,
		providers: [
			{ provide: HTMLDocument, useValue: document },
			{ provide: NgAppConfig, useFactory: () => this.$config, deps: [] },
			{ provide: NgRenderer, deps: [HTMLDocument] },
			{ provide: NgInputFactory, deps: [NgRenderer] },
			{ provide: NgConsole, deps: [] },
			{
				provide: NgLogger,
				useFactory: (r: NgRenderer, c: NgAppConfig) =>
					new NgLogger(r, c.IS_PROD),
				deps: [NgRenderer, NgAppConfig],
			},
			{
				provide: NgHttpOptions,
				useFactory: (config: NgAppConfig) =>
					new NgHttpOptions(config, {
						interceptors: this.$httpInterceptors,
						onFinally: this.forceUpdate,
					}),
				deps: [NgAppConfig],
			},
			{ provide: NgHttp, deps: [NgHttpOptions] },
			{
				provide: NgModal,
				deps: [NgRenderer, NgLogger, NgHttp, NgAppConfig],
				useFactory: (r: NgRenderer, l: NgLogger, h: NgHttp, c: NgAppConfig) =>
					new NgModal(r, l, h, c, this.$injector),
			},
		],
	});

	protected readonly $components = new Map<string, NgComponentOptions>();
	protected readonly $httpInterceptors: NgHttpInterceptor[] = [];
	protected readonly $dependencies: string[] = [];

	protected readonly $module = module(this.$id, this.$dependencies);
	protected readonly $bootstrap = bootstrap;

	protected $router: NgRouter;
	protected $config: NgAppConfig;

	constructor(config: Partial<NgAppConfig>) {
		super();

		this
			.configure(config)
			.$module
			.config([
				'$compileProvider',
				'$locationProvider',
				'$qProvider',
				(
					$compileProvider: {
						debugInfoEnabled(active: boolean): any;
						commentDirectivesEnabled(active: boolean): any;
						cssClassDirectivesEnabled(active: boolean): any;
					},
					$locationProvider: {
						html5Mode(active: boolean): any;
					},
					$qProvider: {
						errorOnUnhandledRejections(active: boolean): any,
					},
				) => {
					const { IS_DEV, IS_STAGING } = this.$config;

					$compileProvider.debugInfoEnabled(!!(IS_DEV || IS_STAGING));
					$compileProvider.commentDirectivesEnabled(false);
					$compileProvider.cssClassDirectivesEnabled(false);

					$locationProvider.html5Mode(true);
					$qProvider.errorOnUnhandledRejections(false);
				},
			])
			.config(['$stateProvider', ($stateProvider: StateProvider) => {
				if (this.router == null) {
					return this.log.$warn('No router. Use `app.setRouter(r)` to disable this warning.');
				}

				for (const definition of this.router.getRoutes()) {
					$stateProvider.state(definition);
				}
			}])
			.run([
				'$injector',
				'$animate',
				(
					$injector: NgInjector,
					$animate: {
						enabled(active: boolean): any,
					},
				) => {
					// @ts-ignore
					this.$injector = $injector;
					$animate.enabled(true);
				},
			]);
	}

	/**
	 * Force the application to run an update cycle
	 */
	public async forceUpdate() {
		this.$injector.get('$rootScope').$applyAsync();
	}

	public async bootstrap({ strictDi }: { strictDi?: boolean; } = { strictDi: true }) {
		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}
		if (this.$router == null) {
			this.$router = new (class extends NgRouter { })();
		}

		setTimeout(() => document.body.classList.add('bootstrapped'));
		return this.$bootstrap(document.body, [this.$id], { strictDi });
	}

	public configure(config: Partial<NgAppConfig>) {
		this.$config = new NgAppConfig(config);
		return this;
	}

	public setRouter(router: NgRouter) {
		this.$router = router;
		return this;
	}

	public addComponents(components: Map<string, NgComponentOptions> | Indexed<NgComponentOptions>) {
		const entries =
			components instanceof Map
				? components.entries()
				: Object.entries(components);

		const { inputs } = this;

		for (let [name, component] of entries) {
			if (this.isInputComponent(component)) {
				component = inputs.defineInputComponent(component);
			}

			if (typeof component.controller === 'function') {
				component.controller = this.makeComponentController(component.controller);
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public isInputComponent(
		component: NgComponentOptions & { type?: 'input' },
	): component is NgInputOptions {
		return component.type === 'input';
	}

	public addDependencies(...moduleNames: string[]) {
		this.$dependencies.push(...moduleNames);
		return this;
	}

	public addHttpInterceptor(interceptor: NgHttpInterceptor) {
		this.$httpInterceptors.push(interceptor);
		return this;
	}

	public makeComponentController<T extends NgController>(rawCtrl: new () => T) {
		const controller = [
			'$element',
			'$scope',
			'$injector',
			makeNg1Controller<T>(rawCtrl, {
				log: this.log,
				http: this.http,
				renderer: this.renderer,
				config: () => this.config,
			}),
		] as const;

		type Writeable<Y> = { -readonly [P in keyof Y]-?: Y[P] };
		return controller as Writeable<typeof controller>;
	}
}
