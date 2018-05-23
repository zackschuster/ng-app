import { InputComponentOptions } from '../../..';
import { NgComponentController } from '../../controller';

class TextInputController extends NgComponentController {
	public min: number | undefined;
	public max: number | undefined;

	public $onInit() {
		if (this.$attrs.type === 'number') {
			this.ngModelCtrl.$validators.minVal = val => {
				const valid = this.min == null || val >= this.min;
				if (valid === false) {
					this.ngModelCtrl.$setTouched();
				}
				return valid;
			};
			this.ngModelCtrl.$validators.maxVal = val => {
				const valid = this.max == null || val <= this.max;
				if (valid === false) {
					this.ngModelCtrl.$setTouched();
				}
				return valid;
			};
		}
	}
}

export const textInput: InputComponentOptions = {
	type: 'input',
	canHaveIcon: true,
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		const input = h.createInput(this.$attrs.type);

		if (input.type === 'number') {
			input.setAttribute('ng-attr-min', '{{$ctrl.min}}');
			input.setAttribute('ng-attr-max', '{{$ctrl.max}}');
			input.setAttribute('ng-attr-step', `{{$ctrl.step || 'any'}}`);
		}

		return input;
	},
	bindings: {
		min: '<',
		max: '<',
		step: '<',
	},
	validators: new Map<string, string>([
		['minVal', 'Must be greater than or equal to {{$ctrl.min}}'],
		['maxVal', 'Must be less than or equal to {{$ctrl.max}}'],
	]),
	ctrl: TextInputController,
};
