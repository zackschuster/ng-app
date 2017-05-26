import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';

class TextBoxController extends CoreInputController {
	/* @ngInject */
	constructor($scope: any, $element: any, $attrs: any) {
		super($scope, $element, $attrs, { maxlength: 3000, placeholder: '' });
	}

	public $postLink() {
		const $input = $('<textarea class="form-control" msd-elastic></textarea>');

		this
			.applyAttributes($input, new Map([
				['name', '{{id}}'],
				['maxlength', '{{maxlength}}'],
				['placeholder', '{{placeholder}}'],
			]))
			.wireToContainer('.form-group', $input);
	}
}

export const textBox = applyCoreDefinition({
	controller: TextBoxController,
}, {
	class: 'form-group',
	srOnly: true,
});
