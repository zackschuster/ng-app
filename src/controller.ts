import { Indexed } from '@ledge/types';

import { NgAttributes } from './attributes';
import { NgHttp } from './http';
import { NgLogger } from './logger';
import { NgService } from './service';
import { NgInjector, NgScope } from './ng';
import { NgAppConfig } from './options';
import { NgRenderer } from './renderer';
import { NgStateService } from './router';

export class NgController extends NgService {
	public readonly $scope!: NgScope;
	public readonly $attrs!: NgAttributes;
	public readonly $injector!: NgInjector;

	public readonly $config!: NgAppConfig;
	public readonly $log!: NgLogger;
	public readonly $http!: NgHttp;
	public readonly $state!: NgStateService;
	public readonly $renderer!: NgRenderer;
	public readonly $element!: HTMLElement;

	public readonly isProduction!: boolean;
	public readonly isDevelopment!: boolean;
	public readonly isStaging!: boolean;
	public readonly apiPrefix!: string;

	public openWebAddress(address: string) {
		this.$log.confirm(`You are being sent to ${address}. Continue?`).then(() => window.open(`http://${address}`));
	}

	/**
	 * Called on each controller after all the controllers on an element have been constructed and had their bindings
	 * initialized (and before the pre & post linking functions for the directives on this element). This is a good
	 * place to put initialization code for your controller.
	 */
	public $onInit?(): void;

	/**
	 * Called on each turn of the digest cycle. Provides an opportunity to detect and act on changes.
	 * Any actions that you wish to take in response to the changes that you detect must be invoked from this hook;
	 * implementing this has no effect on when `$onChanges` is called. For example, this hook could be useful if you wish
	 * to perform a deep equality check, or to check a `Date` object, changes to which would not be detected by Angular's
	 * change detector and thus not trigger `$onChanges`. This hook is invoked with no arguments; if detecting changes,
	 * you must store the previous value(s) for comparison to the current values.
	 */
	public $doCheck?(): void;

	/**
	 * Called whenever one-way bindings are updated. The onChangesObj is a hash whose keys are the names of the bound
	 * properties that have changed, and the values are an object of the form { currentValue, previousValue, isFirstChange() }.
	 * Use this hook to trigger updates within a component such as cloning the bound value to prevent accidental mutation of the outer value.
	 */
	public $onChanges?<T = any>(onChangesObj: {
		[property: string]: {
			currentValue: T;
			previousValue: T;
			isFirstChange(): boolean;
		},
	}): void;

	/**
	 * Called on a controller when its containing scope is destroyed. Use this hook for releasing external resources,
	 * watches and event handlers.
	 */
	public $onDestroy?(): void;

	/**
	 * Called after this controller's element and its children have been linked. Similar to the post-link function this
	 * hook can be used to set up DOM event handlers and do direct DOM manipulation. Note that child elements that contain
	 * templateUrl directives will not have been compiled and linked since they are waiting for their template to load
	 * asynchronously and their own compilation and linking has been suspended until that occurs. This hook can be considered
	 * analogous to the ngAfterViewInit and ngAfterContentInit hooks in Angular 2. Since the compilation process is rather
	 * different in Angular 1 there is no direct mapping and care should be taken when upgrading.
	 */
	public $postLink?(): void;
}

export function makeInjectableCtrl<T extends NgController>(ctrl: new () => T, locals: {
	log: NgLogger,
	http: NgHttp,
	renderer: NgRenderer,
	attrs?: Indexed,
	config(): NgAppConfig;
}) {
	return class InternalController extends (ctrl as new () => any) {
		public $log = locals.log;
		public $http = locals.http;
		public $renderer = locals.renderer;
		public $state: NgStateService;
		public $attrs: NgAttributes;
		public $element: HTMLElement;

		public get $config() {
			return locals.config();
		}
		public get isProduction() {
			return this.$config.IS_PROD;
		}
		public get isDevelopment() {
			return this.$config.IS_DEV;
		}
		public get isStaging() {
			return this.$config.IS_STAGING;
		}
		public get apiPrefix() {
			return this.$config.API_HOST;
		}

		constructor(
			$element: { [i: number]: HTMLElement },
			public $scope: NgScope,
			public $injector: NgInjector,
		) {
			super();

			this.$element = $element[0];
			this.$attrs = new NgAttributes(this.$element, locals.attrs);
			this.$state = this.$injector.get('$state');
		}
	} as new (
			$element: { [i: number]: HTMLElement },
			$scope: NgScope,
			$injector: NgInjector,
		) => T;
}
