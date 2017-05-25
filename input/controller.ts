import { IAttributes, ICompileService, IRootElementService, IScope, ITimeoutService } from 'angular';
import { Callback, Indexed } from '@ledge/types';

/* @ngInject */
export class CoreInputController {
	[index: string]: any;

	public $baseAttrs = new Map([
		['id', '{{id}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-required', 'required || $ctrl.ngRequired'],
		['ng-disabled', 'disabled || $ctrl.ngdisabled'],
		['ng-readonly', 'readonly || $ctrl.ngreadonly'],
	]);

	constructor(
		public $scope: IScope,
		public $element: IRootElementService,
		public $attrs: IAttributes,
		public $compile: ICompileService,
		public $timeout: ITimeoutService,

		/**
		 * Custom element properties
		 */
		public $props: Indexed = {},
	) {}

	public $onInit() {
		this.registerCommonItems();
	}

	public registerCommonItems() {
		this.$scope.id = this.modelIdentifier();
		this.$scope.srOnly = this.isSrOnly();

		this.$scope.required = this.$attrs.hasOwnProperty('required');
		this.$scope.disabled = this.$attrs.hasOwnProperty('disabled');
		this.$scope.readonly = this.$attrs.hasOwnProperty('readonly');

		Object.keys(this.$props).forEach($prop => {
			this.$scope[$prop] = this.$attrs[$prop] || this.$props[$prop];
		});

		return this;
	}

	public applyAttrs($element: JQuery, $attrs: Map<string, string>) {
		for (const [key, value] of $attrs) {
			if (this.$attrs[key] != null) {
				$element.attr(value, this.$attrs[key]);
			}
		}

		return this;
	}

	public afterCurrentWorkload(action: Callback, delay: number = 0) {
		return this.$timeout(action, delay);
	}

	public makeInput(type: string, attrs: Map<string, string> = null) {
		const $input = $(`<input type="${type}" />`);

		if (type !== 'checkbox') {
			$input.addClass('form-control');
		}

		if (attrs != null) {
			this.$baseAttrs = new Map([...this.$baseAttrs, ...attrs]);
		}

		for (const [key, value] of this.$baseAttrs) {
			$input.attr(key, value);
		}

		return $input;
	}

	public wireToContainer($selector: string, $input: JQuery, $options?: { [index: string]: any }) {
		const $compiled = this.compileInput($input);
		const $container = this.$element.find($selector);

		const $opts = Object.assign({ prepend: false }, $options);

		if ($opts.prepend) {
			$container.prepend($compiled);
		} else {
			$container.append($compiled);
		}

		return this;
	}

	public detachSlot() {
		const $slot = this.getTranscluded();

		$slot.detach();

		return $slot;
	}

	public containerHasFields($selectors: string[]) {
		return this.getTranscluded().find($selectors.join(',')).length > 0;
	}

	public containerHasParent($selector: string) {
		return this.$element.closest($selector).length > 0;
	}

	public compileInput($input: JQuery) {
		return this.$compile($input)(this.$scope);
	}

	public getTranscluded() {
		return this.$element.find('[ng-transclude-slot="include"]');
	}

	public isSrOnly() {
		return this.$attrs.hasOwnProperty('srOnly') || this.$element.closest('fieldset').is('[sr-only]');
	}

	public modelIdentifier() {
		return (this.$attrs.ngModel as string).split('.').pop() + '_' + this.$scope.$id;
	}
}
