import { NgComponentController } from '../../../controller';
import { InputComponentOptions } from '../../options';

class TextBoxController extends NgComponentController {
	public $postLink() {
		const hiddenTextAreas = document.querySelectorAll('textarea[aria-hidden="true"]');
		for (const ta of Array.from(hiddenTextAreas).filter(x => x.hasAttribute('aria-label') === false)) {
			ta.setAttribute('aria-label', 'Hidden TextArea');
		}
	}
}

export const textBox: InputComponentOptions = {
	type: 'input',
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		return h.createTextArea();
	},
	ctrl: TextBoxController,
};
