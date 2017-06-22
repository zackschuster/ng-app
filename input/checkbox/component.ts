// tslint:disable:no-invalid-this
import { defineInputComponent } from 'core/input/definition';

export const checkBox = defineInputComponent({
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	nestInputInLabel: true,
	render(h) {
		const input = h.createInput('checkbox');

		if (this.$attrs.hasOwnProperty('inline')) {
			this.$template.classList.remove('form-check');
			this.$template.classList.add('form-check-inline');
		}

		return input;
	},
	bindings: {
		ngChecked: '<',
	},
});
