import { defineComponent } from 'core/input/definition';

export const textBox = defineComponent({
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		return h.createTextArea();
	},
});
