import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';

class TextBoxController extends CoreInputController {
	/* @ngInject */
	constructor($scope: any, $element: any, $attrs: any) {
		super($scope, $element, $attrs, { maxlength: 3000, placeholder: '' });
	}

	public $postLink() {
		const $input = $('<textarea msd-elastic></textarea>');

		for (const [key, value] of this.$baseAttrs) {
			$input.attr(key, value);
		}

		$input
			.attr('name', '{{id}}')
			.attr('maxlength', '{{maxlength}}')
			.attr('placeholder', '{{placeholder}}');

		this.wireToContainer('.form-group', $input);
	}
}

export const textBox = applyCoreDefinition({
	controller: TextBoxController,
});
