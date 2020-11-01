import flatpickr from 'flatpickr';
import { h } from '../renderer';
import { NgInputController, NgInputOptions } from './shared';

function isNumber(n: any): n is number {
	return typeof n === 'number' && !isNaN(n);
}

class DateInputController extends NgInputController {
	private readonly SUPPORTED_MODES = ['single', 'multiple', 'range'];
	private minDate?: Date | number | string;
	private maxDate?: Date | number | string;
	private flatpickr!: flatpickr.Instance;

	public $onInit() {
		this.ngModelCtrl.$validators.minDate = modelVal => {
			if (modelVal != null) {
				if (isNumber(this.minDate)) {
					return this.minDate <= modelVal.valueOf();
				}
				if (this.minDate instanceof Date) {
					return this.minDate.valueOf() <= modelVal.valueOf();
				}
			}
			return true;
		};

		this.ngModelCtrl.$validators.maxDate = modelVal => {
			if (modelVal != null) {
				if (isNumber(this.maxDate)) {
					return this.maxDate >= modelVal.valueOf();
				}
				if (this.maxDate instanceof Date) {
					return this.maxDate.valueOf() >= modelVal.valueOf();
				}
			}
			return true;
		};

		const { inline, mode = 'single' } = this.$attrs;
		if (this.SUPPORTED_MODES.indexOf(mode) === -1) {
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
					return isNaN(maxDate) || d.valueOf() < maxDate;
				},
				d => {
					const minDate = Date.parse(this.minDate as any);
					return isNaN(minDate) || d.valueOf() > minDate;
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
	render() {
		// no ng-model as flatpickr requires control of the input element
		const input =
			<input class='form-control'
				ng-attr-id='ngModel_{{$ctrl.uniqueId}}'
				ng-attr-name='ngModel_{{$ctrl.uniqueId}}'
				ng-model-options='$ctrl.ngModelOptions'
				type='text'
				maxLength={'{{maxlength}}' as never}
				placeholder='{{placeholder}}'
				data-input='true'
			/>;

		return (
			<div class='input-group'>
				<div class='input-group-prepend' data-toggle='true' style={'cursor: pointer;' as never}>
					<span class='input-group-text'>
						<span class='fa fa-calendar' aria-hidden='true'></span>
					</span>
				</div>
				{input}
				<div class='input-group-append' data-clear='true' style={'cursor: pointer;' as never}>
					<span class='input-group-text'>
						<span class='fa fa-times' aria-hidden='true'></span>
					</span>
				</div>
			</div>
		);
	},
	bindings: {
		minDate: '<',
		maxDate: '<',
	},
	validators: {
		minDate: 'Date must be on or after {{$ctrl.getMinDate()}}',
		maxDate: 'Date must be on or before {{$ctrl.getMaxDate()}}',
	},
	controller: DateInputController,
};
