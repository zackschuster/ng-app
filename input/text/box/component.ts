import { InputComponentOptions } from 'core/input/service';

export const textBox: InputComponentOptions = {
	type: 'input',
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		return h.createTextArea();
	},
};
