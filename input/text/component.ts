import { defineInputComponent } from 'core/input/definition';

export const textInput = defineInputComponent({
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		// tslint:disable-next-line:no-invalid-this
		return h.createInput(this.$attrs.type);
	},
});
