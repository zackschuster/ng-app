import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';

class CheckBoxController extends CoreInputController {
	constructor($scope: any, $element: any, $attrs: any, $compile: any, $timeout: any) {
		super($scope, $element, $attrs, $compile, $timeout);
	}

	public $postLink() {
		const $checkbox = this.makeInput('checkbox', new Map<string, string>([
			['value', 'ng-value'],
			['ngTrueValue', 'ng-true-value'],
			['ngFalseValue', 'ng-false-value'],
		]));

		this
			.wireToContainer('label,legend', $checkbox, { prepend: true })
			.afterCurrentWorkload(_ => {
				const $previousElement = this.$element.prev();
				const $nextToCheckBox = $previousElement.is('check-box');

				if ($nextToCheckBox) {
					$previousElement.children().last().attr('style', 'margin-bottom:0;');
				}

				if (this.containerHasParent('check-box-set') === false) {
					$('label[for=' + this.$scope.id + ']').addClass('bold');
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
