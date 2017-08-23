// tslint:disable:no-invalid-this
import { InputComponentOptions } from '../../..';

export const textInput: InputComponentOptions = {
	type: 'input',
	canHaveIcon: true,
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		const input = h.createInput(this.$attrs.type);

		if (input.type === 'number') {
			input.setAttribute('min', this.$attrs.min || '1');
			input.setAttribute('step', this.$attrs.step || 'any');
		}

		return input;
	},
};
