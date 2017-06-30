import { InputComponentOptions } from '../../..';

export const textInput: InputComponentOptions = {
	type: 'input',
	enableInputGroup: true,
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		// tslint:disable-next-line:no-invalid-this
		return h.createInput(this.$attrs.type);
	},
};
