import flatpickr from 'flatpickr';

import { InputComponentOptions } from '../options';
import { NgComponentController } from '../../controller';

function isNumber(n: any): n is number {
	return Number.isInteger(n);
}

class DateInputController extends NgComponentController {
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

		const dateFormat = 'MM/dd/yyyy';
		this.flatpickr = flatpickr(this.$element, {
			dateFormat,
			defaultDate: this.ngModel,
			inline: this.$attrs.inline,
			mode: this.$attrs.mode,
			nextArrow: '&raquo;',
			prevArrow: '&laquo;',
			weekNumbers: true,
			wrap: true,
			enable: [
				(d) => {
					const maxDate = Date.parse(this.maxDate as any);
					return Number.isNaN(maxDate) || d.valueOf() < maxDate;
				},
				(d) => {
					const minDate = Date.parse(this.minDate as any);
					return Number.isNaN(minDate) || d.valueOf() > minDate;
				},
			],
			onChange: (selected) => {
				this.ngModel = selected.length > 1
					? selected
					: selected[0];
				this.$scope.$applyAsync();
			}
		}) as flatpickr.Instance;

		this.$scope.$watch(
			_ => this.ngModel,
			_ => {
				if (_ != null) {
					const parsedDate = flatpickr.parseDate(_) as Date;

					if (this.flatpickr.selectedDates.includes(parsedDate) === false) {
						const date = flatpickr.formatDate(parsedDate, dateFormat);
						this.flatpickr.setDate(date, false);
					}
				}
			}
		)
	}

	public $onDestroy() {
		this.flatpickr.destroy();
	}

	public getMinDate() {
		return new Date(this.minDate as number).toLocaleDateString();
	}

	public getMaxDate() {
		return new Date(this.maxDate as number).toLocaleDateString();
	}
}

export const dateInput: InputComponentOptions = {
	type: 'input',
	render(h) {
		const input = h.createInput('text', [
			['data-input', 'true'],
		]);

		return h.createIconInput(input, 'calendar', [
			['data-toggle', 'true'],
			['style', 'cursor:pointer'],
		]);
	},
	bindings: {
		minDate: '<',
		maxDate: '<',
	},
	validators: new Map([
		['minDate', 'Date must be on or after {{$ctrl.getMinDate()}}'],
		['maxDate', 'Date must be on or before {{$ctrl.getMaxDate()}}'],
	]),
	ctrl: DateInputController,
};
