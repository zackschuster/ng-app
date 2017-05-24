import { IAttributes, ICompileService, IRootElementService, IScope, ITimeoutService } from '@types/angular';
import { Callback, Indexed } from '@ledge/types';

/* @ngInject */
export class CoreInputController {
	constructor(
		public $scope: IScope,
		public $element: IRootElementService,
		public $attrs: IAttributes,
		public $compile: ICompileService,
		public $timeout: ITimeoutService,
	) {}

	public $onInit() {
		this.registerCommonItems();
	}

	public registerCommonItems($props?: Indexed) {
		this.$scope.id = this.modelIdentifier();
		this.$scope.srOnly = this.isSrOnly();

		this.$scope.required = this.$attrs.hasOwnProperty('required');
		this.$scope.disabled = this.$attrs.hasOwnProperty('disabled');
		this.$scope.readonly = this.$attrs.hasOwnProperty('readonly');

		if (Object.prototype.toString.call($props) === '[object Object]') {
			Object.keys($props).forEach($prop => {
				this.$scope.$ctrl[$prop] = this.$attrs[$prop] || $props[$prop];
			});
		}

		return this;
	}

	public afterCurrentWorkload(action: Callback, delay: number = 0) {
		return this.$timeout(action, delay);
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
