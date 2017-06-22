import { InputComponentOptions } from '../../../types';

export const textInput: InputComponentOptions = {
	type: 'input',
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		// tslint:disable-next-line:no-invalid-this
		return h.createInput(this.$attrs.type);
	},
};
