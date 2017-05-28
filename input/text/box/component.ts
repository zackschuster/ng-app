import { defineInputComponent } from 'core/input/definition';

export const textBox = defineInputComponent({
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		return h.createTextArea();
	},
});
