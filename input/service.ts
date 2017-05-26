import { IAttributes, ICompileService, IScope, ITimeoutService } from 'angular';
import { Callback } from '@ledge/types';
import { ng } from 'core/ng';

/* @ngInject */
export class InputService {
	protected $scope: IScope;
	protected $element: JQuery;
	protected $attrs: IAttributes;

	protected $baseAttrs = new Map([
		['id', '{{id}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-required', 'required || $ctrl.ngRequired'],
		['ng-disabled', 'disabled || $ctrl.ngdisabled'],
		['ng-readonly', 'readonly || $ctrl.ngreadonly'],
	]);

	private $compile: ICompileService;
	private $timeout: ITimeoutService;
	private ngModelId: string;

	constructor() {
		this.$compile = ng.compiler();
		this.$timeout = ng.timeout();
	}

	public register($scope: IScope, $element: JQuery, $attrs: IAttributes) {
		this.$scope = $scope;
		this.$element = $element;
		this.$attrs = $attrs;
	}

	public scheduleForLater(action: Callback, delay: number = 0) {
		return this.$timeout(action, delay);
	}

	public compile($input: JQuery, $scope: IScope = this.$scope) {
		return this.$compile($input)($scope);
	}

	public wireToContainer($selector: string, $input: JQuery, $options?: { [index: string]: any }) {
		const $compiled = this.compile($input);
		const $container = this.$element.find($selector);

		const $opts = Object.assign({ prepend: false }, $options);

		if ($opts.prepend) {
			$container.prepend($compiled);
		} else {
			$container.append($compiled);
		}

		return this;
	}

	public makeInput(type: string, attrs: Map<string, string> = new Map()) {
		const $input = $(`<input type="${type}" />`);

		if (type !== 'checkbox') {
			$input.addClass('form-control');
		}

		for (const [key, value] of new Map([...this.$baseAttrs, ...attrs])) {
			$input.attr(key, value);
		}

		return $input;
	}

	protected getTranscluded() {
		return this.$element.find('[ng-transclude-slot="contain"],[ng-transclude="contain"]');
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
