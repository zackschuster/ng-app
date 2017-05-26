import { IAttributes, ICompileService, IRootElementService, IScope, ITimeoutService, injector } from 'angular';
import { Callback, Indexed } from '@ledge/types';

/* @ngInject */
export class CoreInputController {
	protected ngModel: any;
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

	constructor(
		protected $scope: IScope,
		protected $element: IRootElementService,
		protected $attrs: IAttributes,
		/**
		 * Custom element properties
		 */
		public $props: Indexed = {},
	) {
		const $injector = injector(['ng']);

		this.$timeout = $injector.get('$timeout');
		this.$compile = $injector.get('$compile');

		this.modifyScope();
		this.scheduleForLater(_ => this.modifyLabel());
	}

	protected makeInput(type: string, attrs: Map<string, string> = new Map()) {
		const $input = $(`<input type="${type}" />`);

		if (type !== 'checkbox') {
			$input.addClass('form-control');
		}

		for (const [key, value] of new Map([...this.$baseAttrs, ...attrs])) {
			$input.attr(key, value);
		}

		return $input;
	}

	protected wireToContainer($selector: string, $input: JQuery, $options?: { [index: string]: any }) {
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

	protected scheduleForLater(action: Callback, delay: number = 0) {
		return this.$timeout(action, delay);
	}

	protected compile($input: JQuery) {
		return this.$compile($input)(this.$scope);
	}

	protected getTranscluded() {
		return this.$element.find('[ng-transclude-slot="include"]');
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

	private modifyScope() {
		this.$scope.id = this.modelIdentifier();

		this.$scope.required = this.$attrs.hasOwnProperty('required');
		this.$scope.disabled = this.$attrs.hasOwnProperty('disabled');
		this.$scope.readonly = this.$attrs.hasOwnProperty('readonly');

		Object.keys(this.$props).forEach($prop => {
			this.$scope[$prop] = this.$attrs[$prop] || this.$props[$prop];
		});
	}

	private modifyLabel() {
		const $label = this.$element.find('label').attr('for', this.$scope.id);

		if (this.isSrOnly()) {
			$label.addClass('sr-only');
		}
		const $labelChildren = $label.children();
		if ($label.is(':empty') || $labelChildren.length === 1 && $labelChildren.is('input')) {
			$label.append(this.modelIdentifier({ unique: false }).split(/(?=[A-Z])/).join(' '));
		}
	}
}
