// tslint:disable:no-empty-interface max-line-length
import { IAttributes, ICompileService, IComponentOptions, IRootElementService, IScope, ITimeoutService, auto } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';
import { IState } from 'angular-ui-router';
import { Callback, IConfig, Indexed } from '@ledge/types';
import { CoreInputController } from './src/input/controller';

export class NgApp {
	$injector: auto.IInjectorService
	name: string;
	config: IConfig;
	bootstrap(): void;
	http(): NgDataService;
	logger(): NgLogger;
	modal(): NgModalService;
	registerComponents(components: Map<string, IComponentOptions>): this;
	registerRoutes(routes: IState[]): this;
	compiler(): ICompileService;
	renderer(): NgRenderer;
	root(): IRootElementService;
	scope(): IScope;
	timeout(): ITimeoutService;
}

export abstract class NgController {
	protected $scope: IScope;
	protected $element?: IRootElementService;
	protected $timeout?: ITimeoutService;
	protected $log?: NgLogger;

	constructor(
		$scope?: IScope,
		$element?: IRootElementService,
		$timeout?: ITimeoutService,
		$log?: NgLogger,
	);
}

export class NgDataService {
	Get<T = any>(url: string, defaultReturn?: T): PromiseLike<T>;
	Post<T = any>(url: string, data?: T): PromiseLike<T>;
}

export class NgLogger {
	confirm(action: Callback): void;
	error(msg: string): void;
	info(msg: string): void;
	success(msg: string): void;
	warning(msg: string): void;
	devWarning(msg: string): void;
}

export class NgRenderer {
	baseInputAttrs: [string, string][];
	createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, classes?: string[], attrs?: [string, string][]): HTMLElementTagNameMap[T];
	createInput(type?: string, attrs?: [string, string][]): HTMLInputElement;
	createTextArea(): HTMLTextAreaElement;
	createIcon(icon: string): HTMLSpanElement;
	createLabel(classList: string[]): HTMLLabelElement;
	createSlot(name: string): Element;
}

export class NgModalService {
	open(options: NgModalOptions): IModalInstanceService;
}

export interface NgModalOptions {
	template?: string;
	appendTo?: Element;
	size?: 'sm' | 'md' | 'lg';
	controller?: any;
	controllerAs?: string;
}

export interface InputComponentOptions extends IComponentOptions {
	/**
	 * Set this so the app knows how to register your $definition
	 */
	type: 'input';

	ctrl?: typeof CoreInputController;

	/**
	 * Special attributes to set on the input
	 */
	attrs?: Indexed;

	/**
	 * CSS class to apply to the input container. Defaults to 'form-group'.
	 */
	templateClass?: string;

	/**
	 * CSS class to apply to the input label. Defaults to 'form-control-label'.
	 */
	labelClass?: string;

	/**
	 * Whether the rendered input should be nested inside the label
	 */
	nestInputInLabel?: boolean;

	/**
	 * Run after container & label creation, before label manipulation
	 */
	render(this: {
		/**
		 * Input container
		 */
		$template: HTMLDivElement;
		/**
		 * Angular.js $attrs object
		 */
		$attrs: IAttributes;
	}, h: NgRenderer): Element;

	/**
	 * Special hook to override how label text is generated
	 */
	renderLabel?(this: { $label: HTMLLabelElement }, h: NgRenderer): void;
}

export const app: NgApp;
