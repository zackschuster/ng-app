import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';

class TextBoxController extends CoreInputController {
	constructor($scope: any, $element: any, $attrs: any, $compile: any, $timeout: any) {
		super($scope, $element, $attrs, $compile, $timeout, { maxlength: 3000, placeholder: '' });
	}
}

export const textBox = applyCoreDefinition({
	template: require('./template.pug')(),
	controller: TextBoxController,
});
