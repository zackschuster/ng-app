import { IAttributes, ICompileService, IScope, ITimeoutService } from 'angular';
import { Callback } from '@ledge/types';
import { app } from 'core';

/* @ngInject */
export class InputService {
	protected static BaseAttributes: [string, string][] = [
		['id', '{{id}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-required', 'required || $ctrl.ngRequired'],
		['ng-disabled', 'disabled || $ctrl.ngdisabled'],
		['ng-readonly', 'readonly || $ctrl.ngreadonly'],
	];

	protected $scope: IScope;
	protected $element: JQuery;
	protected $attrs: IAttributes;

	private $compile: ICompileService;
	private $timeout: ITimeoutService;
	private ngModelId: string;

	constructor() {
		this.$compile = app.compiler();
		this.$timeout = app.timeout();
	}

	public registerScope($scope: IScope) {
		this.$scope = $scope;
		return this;
	}

	public registerElement($element: JQuery) {
		this.$element = $element;
		return this;
	}

	public registerAttributes($attrs: IAttributes) {
		this.$attrs = $attrs;
		return this;
	}

	public register($scope: IScope, $element: JQuery, $attrs: IAttributes) {
		return this
			.registerScope($scope)
			.registerElement($element)
			.registerAttributes($attrs);
	}

	public scheduleForLater(action: Callback, delay: number = 0) {
		return this.$timeout(action, delay);
	}

	public compile($input: JQuery | Element, $scope: IScope = this.$scope) {
		return this.$compile($input)($scope);
	}

	public wireToContainer($selector: string, $input: Element, $options?: { [index: string]: any }) {
		const $compiled = this.compile($input);
		const $container = this.$element.find($selector);

		const $opts = Object.assign({ prepend: false }, $options);

		if ($opts.prepend) {
			$container.prepend($compiled);
		} else {
			$container.append($compiled);
		}

		this.removeEmptyDivs();

		return this;
	}

	public createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, classes: string[] = ['form-control']) {
		const $el = document.createElement<T>(tagName);
		$el.classList.add(...classes);
		return $el;
	}

	public makeInput(type: string = 'text', attrs: [string, string][] = []) {
		const $input = this.createElement('input', type === 'checkbox' ? [] : undefined);

		attrs.push(['type', type]);
		this.applyAttributes($input, attrs);

		return $input;
	}

	public makeLabel() {
		const $label = this.createElement('label', ['control-label']);

		$label.setAttribute('for', '{{id}}');
		$label.setAttribute('ng-transclude', '');

		if (this.isSrOnly()) {
			$label.classList.add('sr-only');
		}

		return $label;
	}

	protected removeEmptyDivs() {
		return this.$element.find('div:empty').detach();
	}

	protected applyAttributes(input: Element, attrs: [string, string][] = []) {
		for (const [key, value] of new Map([...InputService.BaseAttributes, ...attrs])) {
			input.setAttribute(key, value);
		}

		return this;
	}

	protected isSrOnly() {
		return this.$attrs.hasOwnProperty('srOnly') || this.$element.closest('fieldset').is('[sr-only]');
	}

	protected modelIdentifier(opts = { unique: true }) {
		if (this.ngModelId == null) {
			this.ngModelId = (this.$attrs.ngModel as string).split('.').pop();
		}
		return this.ngModelId + (opts.unique ? '_' + this.$scope.$id : '');
	}
}
