import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';
import { IAttributes, ICompileService, IRootElementService, IScope, ITimeoutService } from '@types/angular';

class CheckBoxController extends CoreInputController {
	constructor(
		$scope: IScope,
		$element: IRootElementService,
		$attrs: IAttributes,
		$compile: ICompileService,
		$timeout: ITimeoutService,
	) {
		super($scope, $element, $attrs, $compile, $timeout);
	}

	public $postLink() {
		const $checkbox = $(`
			<input type="checkbox" id="{{id}}" ng-model="$ctrl.ngModel"
				ng-required="required || $ctrl.ngRequired"
				ng-disabled="disabled || $ctrl.ngDisabled"
				ng-readonly="readonly || $ctrl.ngReadonly"
			/>
		`);

		if (this.$attrs.value != null) {
			$checkbox.attr('ng-value', this.$attrs.value);
		}

		if (this.$attrs.ngTrueValue != null) {
			$checkbox.attr('ng-true-value', this.$attrs.ngTrueValue);
		}

		if (this.$attrs.ngFalseValue != null) {
			$checkbox.attr('ng-false-value', this.$attrs.ngFalseValue);
		}

		this
			.wireToContainer('label,legend', $checkbox, { prepend: true })
			.afterCurrentWorkload(_ => {
				const $previousElement = this.$element.prev();
				const $nextToCheckBox = $previousElement.is('check-box');

				if ($nextToCheckBox) {
					$previousElement.children().last().attr('style', 'margin-bottom:0;');
				}

				const $includesTextInput = this.containerHasFields(['text-input', 'text-box']);
				const $embeddedInCheckBoxSet = this.containerHasParent('check-box-set');

				if ($includesTextInput === true && $embeddedInCheckBoxSet === false && !this.$attrs.hasOwnProperty('noBold')) {
					$('label[for=' + this.$scope.id + ']').wrapInner('<strong></strong>');
				}
			});
	}
}

export const checkBox = applyCoreDefinition({
	template: require('./template.pug')(),
	bindings: {
		ngChecked: '<',
	},
	controller: CheckBoxController,
});
