import { Indexed } from '@ledge/types';
import { NgInputOptions } from './shared/options';
import { NgInputController } from './shared/controller';

class TextInputController extends NgInputController {
	private min: number | undefined;
	private max: number | undefined;

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

export const textInput: NgInputOptions = {
	type: 'input',
	canHaveIcon: true,
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		const { type, minlength } = this.$attrs;

		const input = h.createInput(type);

		if (type === 'number' || type === 'range') {
			input.setAttribute('ng-attr-min', '{{$ctrl.min}}');
			input.setAttribute('ng-attr-max', '{{$ctrl.max}}');
			input.setAttribute('ng-attr-step', `{{$ctrl.step || 'any'}}`);
		}

		if (minlength != null) {
			input.setAttribute('pattern', `.{${minlength},}`);
			validators.pattern = `Input must be at least ${minlength} characters`;
		}

		return input;
	},
	postRender(h) {
		if (this.$attrs.type === 'range') {
			const text = h.createElement('p', ['text-center', 'lead']);
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
	ctrl: TextInputController,
};

export const htmlInput = Object.assign({}, textInput);
