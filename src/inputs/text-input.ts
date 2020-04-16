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
				return val != null && val.length >= minlength;
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
	render(h) {
		const { type, minlength } = this.$attrs;

		const input = h.createInput(type);

		const isRange = type === 'range';
		if (type === 'number' || isRange) {
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
	postRender(h) {
		if (this.$attrs.type === 'range') {
			const text = h.createHtmlElement('p', ['text-center', 'lead']);
			text.textContent = '{{$ctrl.ngModel}}';
			this.$template.appendChild(text);
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

export const htmlInput = { ...textInput };
