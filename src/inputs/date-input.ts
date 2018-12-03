import flatpickr from 'flatpickr';
import { NgInputController, NgInputOptions } from './shared';

function isNumber(n: any): n is number {
	return Number.isInteger(n);
}

class DateInputController extends NgInputController {
	private readonly SUPPORTED_MODES = ['single', 'multiple', 'range'];
	private minDate?: Date | number | string;
	private maxDate?: Date | number | string;
	private flatpickr: flatpickr.Instance;

	public $onInit() {
		this.ngModelCtrl.$validators.minDate = modelVal => {
			if (modelVal != null) {
				if (isNumber(this.minDate)) {
					return this.minDate <= modelVal.valueOf();
				} else if (this.minDate instanceof Date) {
					return this.minDate.valueOf() <= modelVal.valueOf();
				}
			}
			return true;
		};

		this.ngModelCtrl.$validators.maxDate = modelVal => {
			if (modelVal != null) {
				if (isNumber(this.maxDate)) {
					return this.maxDate >= modelVal.valueOf();
				} else if (this.maxDate instanceof Date) {
					return this.maxDate.valueOf() >= modelVal.valueOf();
				}
			}
			return true;
		};

		const { inline, mode = 'single' } = this.$attrs;
		if (this.SUPPORTED_MODES.includes(mode) === false) {
			this.$log.devWarning(`Unsupported date-input \`mode\` ('${mode}') for #${this.$element.id}. Expected one of ${this.SUPPORTED_MODES.join(', ')}.`);
		}

		this.flatpickr = flatpickr(this.$element, {
			dateFormat: 'M n Y (l)',
			defaultDate: this.ngModel,
			inline: inline === 'true',
			mode,
			nextArrow: '&raquo;',
			prevArrow: '&laquo;',
			allowInput: true,
			weekNumbers: true,
			wrap: true,
			enable: [
				d => {
					const maxDate = Date.parse(this.maxDate as any);
					return Number.isNaN(maxDate) || d.valueOf() < maxDate;
				},
				d => {
					const minDate = Date.parse(this.minDate as any);
					return Number.isNaN(minDate) || d.valueOf() > minDate;
				},
			],
			onChange: selected => {
				this.ngModel = selected.length > 1
					? selected
					: selected[0];

				this.$scope.$applyAsync();
			},
		}) as flatpickr.Instance;
	}

	public $onDestroy() {
		if (this.flatpickr != null && typeof this.flatpickr.destroy === 'function') {
			this.flatpickr.destroy();
		}
	}

	public getMinDate() {
		return new Date(this.minDate as number).toLocaleDateString();
	}

	public getMaxDate() {
		return new Date(this.maxDate as number).toLocaleDateString();
	}
}

export const dateInput: NgInputOptions = {
	type: 'input',
	render(h) {
		const input = h.createInput('text');

		// flatpickr requires control of the input element
		input.removeAttribute('ng-model');
		input.setAttribute('data-input', 'true');

		const iconInput = h.createIconInput(input, 'calendar', [
			['data-toggle', 'true'],
			['style', 'cursor: pointer;'],
		]);

		const inputGroupAppend = h.createHtmlElement('div', ['input-group-append']);
		inputGroupAppend.setAttribute('data-clear', 'true');
		inputGroupAppend.style.setProperty('cursor', 'pointer');

		const inputGroupText = h.createHtmlElement('span', ['input-group-text']);
		const clearIcon = h.createIcon('x');

		inputGroupText.appendChild(clearIcon);
		inputGroupAppend.appendChild(inputGroupText);
		iconInput.appendChild(inputGroupAppend);

		return iconInput;
	},
	bindings: {
		minDate: '<',
		maxDate: '<',
	},
	validators: {
		minDate: 'Date must be on or after {{$ctrl.getMinDate()}}',
		maxDate: 'Date must be on or before {{$ctrl.getMaxDate()}}',
	},
	ctrl: DateInputController,
};
