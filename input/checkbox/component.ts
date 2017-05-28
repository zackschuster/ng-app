import { defineInputComponent } from 'core/input/definition';

export const checkBox = defineInputComponent({
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	nestInputInLabel: true,
	render(h) {
		return h.createInput('checkbox');
	},
	bindings: {
		ngChecked: '<',
	},
});
