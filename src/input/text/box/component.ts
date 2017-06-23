import { InputComponentOptions } from '../../../../types';

export const textBox: InputComponentOptions = {
	type: 'input',
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		return h.createTextArea();
	},
};
