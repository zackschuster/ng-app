import { h } from '../renderer';
import { NgInputOptions } from './shared';

export const checkBox: NgInputOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	render() {
		const input =
			<input class='form-check-input'
				ng-attr-id='ngModel_{{$ctrl.uniqueId}}'
				ng-attr-name='ngModel_{{$ctrl.uniqueId}}'
				ng-model='$ctrl.ngModel'
				ng-model-options='$ctrl.ngModelOptions'
				type='checkbox'
				style={'cursor: pointer;' as never} />;

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
