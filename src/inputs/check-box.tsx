import { h } from '../dom';
import { NgInputOptions } from './shared';

export const checkBox: NgInputOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	render() {
		if (this.$attrs.hasOwnProperty('inline')) {
			this.$template.classList.remove('form-check');
			this.$template.classList.add('form-check-inline');
		}

		return <input class='form-check-input' ng-checked='$ctrl.ngChecked' type='checkbox' />;
	},
	bindings: {
		ngChecked: '<',
	},
};
