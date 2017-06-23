// tslint:disable:no-empty-interface max-line-length
import { IAttributes, ICompileService, IComponentOptions, IRootElementService, IScope, ITimeoutService } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';
import { Callback, IConfig, Indexed } from '@ledge/types';
import { CoreInputController } from './src/input/controller';

export interface IApp {
	name: string;
	config: IConfig;
	bootstrap(): void;
	http(): DataService;
	logger(): Logger;
	modal(): ModalService;
	registerComponents(components: { [name: string]: IComponentOptions }): this;
	compiler(): Compiler;
	root(): RootElement;
	renderer(): Renderer;
	scope(): Scope;
	timeout(): Timeout;
}

export interface Compiler extends ICompileService {}
export interface RootElement extends IRootElementService {}
export interface Scope extends IScope {}
export interface Timeout extends ITimeoutService {}

export interface DataService {
	Get<T = any>(url: string, defaultReturn?: T): PromiseLike<T>;
	Post<T = any>(url: string, data?: T): PromiseLike<T>;
}

export interface ModalOptions {
	template?: string;
	appendTo?: Element;
	size?: 'sm' | 'md' | 'lg';
	controller?: any;
	controllerAs?: string;
}

export interface ModalService {
	open(options: ModalOptions): IModalInstanceService;
}

export interface Logger {
	confirm(action: Callback): void;
	error(msg: string): void;
	info(msg: string): void;
	success(msg: string): void;
	warning(msg: string): void;
	devWarning(msg: string): void;
}

export interface Renderer {
	baseInputAttrs: [string, string][];
	createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, classes?: string[], attrs?: [string, string][]): HTMLElementTagNameMap[T];
	createInput(type?: string, attrs?: [string, string][]): HTMLInputElement;
	createTextArea(): HTMLTextAreaElement;
	createIcon(icon: string): HTMLSpanElement;
	createLabel(classList: string[]): HTMLLabelElement;
	createSlot(name: string): Element;
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
	render(this: RenderObjects, h: Renderer): Element;

	/**
	 * Special hook to override how label text is generated
	 */
	renderLabel?(this: { $label: HTMLLabelElement }, h: Renderer): void;
}

interface RenderObjects {
	/**
	 * Input container
	 */
	$template: HTMLDivElement;
	/**
	 * Angular.js $attrs object
	 */
	$attrs: IAttributes;
}

export const app: IApp;
export const config: IConfig;
export const name: string;

export abstract class NgController {
	protected $scope: IScope;
	protected $element?: IRootElementService;
	protected $timeout?: ITimeoutService;
	protected $log?: Logger;

	constructor(
		$scope?: IScope,
		$element?: IRootElementService,
		$timeout?: ITimeoutService,
		$log?: Logger,
	);
}

export class NgRenderer implements Renderer {
	baseInputAttrs: [string, string][];
	createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, classes?: string[], attrs?: [string, string][]): HTMLElementTagNameMap[T];
	createInput(type?: string, attrs?: [string, string][]): HTMLInputElement;
	createTextArea(): HTMLTextAreaElement;
	createIcon(icon: string): HTMLSpanElement;
	createLabel(classList: string[]): HTMLLabelElement;
	createSlot(name: string): Element;
}
