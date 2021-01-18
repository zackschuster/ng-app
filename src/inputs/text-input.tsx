import { h } from '@ledge/jsx';
import { Indexed } from '@ledge/types';
import { NgInputController, NgInputOptions } from './shared';

class TextInputController extends NgInputController {
	public min: number | undefined;
	public max: number | undefined;

	public $onInit() {
		const { type, minlength } = this.$attrs;

		if (type === 'number') {
			this.ngModelCtrl.$validators.minVal = val => {
				return this.min == null || val >= this.min;
			};
			this.ngModelCtrl.$validators.maxVal = val => {
				return this.max == null || val <= this.max;
			};
		}

		if (minlength != null) {
			this.ngModelCtrl.$validators.pattern = val => {
				return val?.length >= minlength;
			};
		}
	}
}

const validators: Indexed<string> = {
	minVal: 'Must be greater than or equal to {{$ctrl.min}}',
	maxVal: 'Must be less than or equal to {{$ctrl.max}}',
};

export const textInput: NgInputOptions<TextInputController> = {
	type: 'input',
	canHaveIcon: true,
	attrs: { maxlength: 3000, placeholder: '' },
	render() {
		const { type = 'text', minlength } = this.$attrs;
		const input = <input class='form-control' type={type} maxLength={'{{maxlength}}' as never} placeholder='{{placeholder}}' />;

		const isRange = type === 'range';
		if (type === 'number' || isRange) {
			if (isRange) {
				input.classList.remove('form-control');
				input.classList.add('custom-range');
				input.removeAttribute('maxlength');
				input.removeAttribute('placeholder');
			}
			input.setAttribute('ng-attr-min', '{{$ctrl.min}}');
			input.setAttribute('ng-attr-max', '{{$ctrl.max}}');
			input.setAttribute('ng-attr-step', `{{$ctrl.step || '${isRange ? 1 : 'any'}'}}`);
		}

		if (minlength != null) {
			input.setAttribute('pattern', `.{${minlength},}`);
			validators.pattern = `Input must be at least ${minlength} characters`;
		}

		return input;
	},
	postRender() {
		if (this.$attrs.type === 'range') {
			this.$template.appendChild(
				<p class='text-center lead'>{'{{$ctrl.ngModel}}'}</p>,
			);
		}
		return this.$template;
	},
	bindings: {
		min: '<',
		max: '<',
		step: '<',
	},
	validators,
	controller: TextInputController,
};

export const htmlInput = window.angular.copy(textInput);
