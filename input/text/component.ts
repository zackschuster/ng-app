import { defineInputComponent } from 'core/input/definition';

export const textInput = defineInputComponent({
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		return h.createInput();
	},
});
