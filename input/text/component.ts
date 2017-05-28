import { defineComponent } from 'core/input/definition';

export const textInput = defineComponent({
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		return h.createInput();
	},
});
