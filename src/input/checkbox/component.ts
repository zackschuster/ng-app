import { NgInputOptions } from '../options';

export const checkBox: NgInputOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
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
};
