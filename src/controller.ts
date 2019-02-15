import { autobind } from 'core-decorators';
import { Indexed } from '@ledge/types';
import { NgAppConfig } from './options';
import { NgHttp, NgLogger, NgService, NgStateService } from './services';

export class NgController extends NgService {
	public readonly $scope: angular.IScope;
	public readonly $attrs: angular.IAttributes;
	public readonly $injector: angular.auto.IInjectorService;

	public readonly $config: NgAppConfig;
	public readonly $log: NgLogger;
	public readonly $http: NgHttp;
	public readonly $state: NgStateService;
	public readonly $element: HTMLElement;

	public readonly isProduction: boolean;
	public readonly isDevelopment: boolean;
	public readonly isStaging: boolean;
	public readonly apiPrefix: string;

	public openWebAddress(address: string) {
		this.$log.confirm(`You are being sent to ${address}. Continue?`).then(() => window.open(`http://${address}`));
	}

	public getApiPrefix() {
		return this.apiPrefix;
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
	 * to perform a deep equality check, or to check a `Dat`e object, changes to which would not be detected by Angular's
	 * change detector and thus not trigger `$onChanges`. This hook is invoked with no arguments; if detecting changes,
	 * you must store the previous value(s) for comparison to the current values.
	 */
	public $doCheck?(): void;

	/**
	 * Called whenever one-way bindings are updated. The onChangesObj is a hash whose keys are the names of the bound
	 * properties that have changed, and the values are an {@link IChangesObject} object  of the form
	 * { currentValue, previousValue, isFirstChange() }. Use this hook to trigger updates within a component such as
	 * cloning the bound value to prevent accidental mutation of the outer value.
	 */
	public $onChanges?(onChangesObj: angular.IOnChangesObject): void;

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

export function makeInjectableCtrl($controller: new () => angular.IController, locals: {
	log: NgLogger,
	http: NgHttp,
	attrs?: Indexed,
	config(): NgAppConfig;
}) {
	autobind($controller);
	return class InternalController extends $controller {
		public $log = locals.log;
		public $http = locals.http;
		public $element: HTMLElement;
		public $attrs: angular.IAttributes;
		public $state: NgStateService;

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
			return this.$config.getApiPrefix();
		}

		constructor(
			$element: JQLite,
			public $scope: angular.IScope,
			public $injector: angular.auto.IInjectorService,
		) {
			super();

			this.$element = $element[0];
			this.$attrs = new Attributes(this.$element, locals.attrs);
			this.$state = this.$injector.get('$state');
		}
	};
}

export class Attributes implements angular.IAttributes {
	[name: string]: string | object;
	public readonly $attr: Indexed<string> = { };

	public PREFIX_REGEXP = /^((?:x|data)[:\-_])/i;
	public SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;

	constructor(private readonly $$element: Element, attrs: Indexed = { }) {
		for (const attr of Array.from($$element.attributes)) {
			const normalized = this.$normalize(attr.name);
			this[normalized] = attr.value;
			this.$attr[attr.name] = normalized;
		}

		for (const [key, value] of Object.entries(attrs)) {
			const normalized = this.$normalize(key);
			this[normalized] = value;
			this.$attr[key] = normalized;
		}
	}

	public $normalize(name: string) {
		return name
			.replace(this.PREFIX_REGEXP, '')
			.replace(this.SPECIAL_CHARS_REGEXP, (_, letter, offset) => offset ? letter.toUpperCase() : letter);
	}

	public $addClass(className: string) {
		this.$$element.classList.add(className);
	}

	public $removeClass(className: string) {
		this.$$element.classList.remove(className);
	}

	public $updateClass(_: string, __: string) {
		// tslint:disable-next-line:no-console
		console.warn('$updateClass is a noop');
	}

	public $set(_: string, __: any) {
		// tslint:disable-next-line:no-console
		console.warn('$set is a noop');
	}

	public $observe<T>(_: string, __: (value?: T) => any) {
		// tslint:disable-next-line:no-console
		console.warn('$observe is a noop');
		return () => { return; };
	}
}
