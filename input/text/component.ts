import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';

class TextInputController extends CoreInputController {
	/* @ngInject */
	constructor($scope: any, $element: any, $attrs: any) {
		super($scope, $element, $attrs, { maxlength: 3000, placeholder: '' });
	}

	public $postLink() {
		const $input = this.makeInput('text');

		if (this.$scope.disabled) {
			$input
				.removeAttr('ng-model')
				.attr('placeholder', '{{$ctrl.ngModel}}');
		}

		this.wireToContainer('.form-group', $input);
	}
}

export const textInput = applyCoreDefinition({
	controller: TextInputController,
});
