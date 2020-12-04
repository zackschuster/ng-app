import { isIE11 } from '@ledge/is-ie-11';
import { h } from '@ledge/jsx';
import { NgInputController, NgInputOptions } from './shared';

function isNumber(n: any): n is number {
	return typeof n === 'number' && !isNaN(n);
}

class DateInputController extends NgInputController {
	public ngModel: Date | null | undefined;
	private minDate?: Date | number | string;
	private maxDate?: Date | number | string;

	public $onInit() {
		this.ngModelCtrl.$validators.minDate = modelVal => {
			if (isNumber(this.minDate) || this.minDate instanceof Date) {
				return this.minDate.valueOf() <= modelVal?.valueOf() ?? 0;
			}
			return true;
		};

		this.ngModelCtrl.$validators.maxDate = modelVal => {
			if (isNumber(this.maxDate) || this.maxDate instanceof Date) {
				return this.maxDate.valueOf() >= modelVal?.valueOf();
			}
			return true;
		};
	}

	public $postLink() {
		setTimeout(() => {
			if (document.querySelector('input[type="date"]') == null) {
				const daySelect = document.querySelector(`#day_${this.uniqueId}`) as HTMLSelectElement;
				const monthSelect = document.querySelector(`#month_${this.uniqueId}`) as HTMLSelectElement;
				const yearSelect = document.querySelector(`#year_${this.uniqueId}`) as HTMLSelectElement;

				const updateNgModel = () => {
					this.ngModel = new Date(
						Number(yearSelect.value),
						Number(monthSelect.value),
						Number(daySelect.value),
					);
					this.$scope.$applyAsync();
				};

				daySelect.onchange = () => {
					updateNgModel();
				};
				monthSelect.onchange = () => {
					updateNgModel();
					this.update();
				};
				yearSelect.onchange = () => {
					updateNgModel();
					this.update();
				};

				this.update();
			}
		});
	}

	public update() {
		const day = new Date(this.ngModel ?? Date.now());
		const daySelect = document.querySelector(`#day_${this.uniqueId}`) as HTMLSelectElement;
		while (daySelect.options.length > 0) {
			daySelect.options.remove(0);
		}
		const currentDay = day.getDate();
		const day2 = new Date(day);
		day2.setDate(0);
		const maxDay = day2.getDate();
		let dayOption = 1;
		while (dayOption <= maxDay) {
			const option = <option value={`${dayOption}`}>{dayOption}</option> as HTMLOptionElement;
			if (dayOption === currentDay) {
				option.setAttribute('selected', 'selected');
			} else {
				option.removeAttribute('selected');
			}
			daySelect.appendChild(option);
			dayOption++;
		}

		const currentMonth = day.getMonth();
		const monthSelect = document.querySelector(`#month_${this.uniqueId}`) as HTMLSelectElement;
		if (Number(monthSelect.value) !== currentMonth) {
			for (const option of monthSelect.options) {
				if (Number(option.value) === currentMonth) {
					option.setAttribute('selected', 'selected');
				} else {
					option.removeAttribute('selected');
				}
			}
		}

		const currentYear = day.getFullYear();
		const yearSelect = document.querySelector(`#year_${this.uniqueId}`) as HTMLSelectElement;
		if (Number(yearSelect.value) !== currentYear) {
			for (const option of yearSelect.options) {
				if (Number(option.value) === currentYear) {
					option.setAttribute('selected', 'selected');
				} else {
					option.removeAttribute('selected');
				}
			}
		}
	}
}

export const dateInput: NgInputOptions = {
	type: 'input',
	render() {
		const useFallback = this.$attrs.hasOwnProperty('useFallback');
		let useNativeDatepicker = !useFallback && !isIE11();

		let input =
			<input class='form-control' ng-attr-min='{{$ctrl.minDate}}' ng-attr-max='{{$ctrl.maxDate}}' />;

		if (useNativeDatepicker) {
			try {
				(input as HTMLInputElement).type = 'date';
				useNativeDatepicker = (input as HTMLInputElement).type === 'date';
			} catch {
				useNativeDatepicker = false;
			}
		}

		if (useNativeDatepicker === false) {
			const currentDate = new Date();
			const currentMonth = currentDate.getMonth();
			const currentYear = currentDate.getFullYear();

			let { minYear, maxYear, defaultYear, defaultMonth } = this.$attrs;
			minYear = Number(minYear ??= currentYear - 99);
			maxYear = Number(maxYear ??= currentYear + 99);
			defaultYear = Number(defaultYear ??= currentYear);
			defaultMonth = Number(defaultMonth ??= currentMonth);

			const monthSelect =
				<select class='form-control' ng-attr-id='month_{{$ctrl.uniqueId}}'>
					{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((x, i) => {
						const option = <option value={`${i}`}>{x}</option> as HTMLOptionElement;
						if (i === defaultMonth) option.setAttribute('selected', 'selected');
						return option;
					})}
				</select> as HTMLSelectElement;

			const yearSelect = <select class='form-control' ng-attr-id='year_{{$ctrl.uniqueId}}'></select> as HTMLSelectElement;
			let yearOption = minYear;
			while (yearOption <= maxYear) {
				const option = <option value={`${yearOption}`}>{yearOption}</option> as HTMLOptionElement;
				if (yearOption === defaultYear) option.setAttribute('selected', 'selected');
				yearSelect.appendChild(option);
				yearOption++;
			}

			input = <fieldset class='w-100 px-2 mt-2 mb-n1'>
				<div class='form-group row'>
					<label class='col-xl-4 col-form-label' ng-attr-for='day_{{$ctrl.uniqueId}}'>Day</label>
					<div class='col'>
						<select class='form-control' ng-attr-id='day_{{$ctrl.uniqueId}}'></select>
					</div>
				</div>
				<div class='form-group row'>
					<label class='col-xl-4 col-form-label' ng-attr-for='month_{{$ctrl.uniqueId}}'>Month</label>
					<div class='col'>
						{monthSelect}
					</div>
				</div>
				<div class='form-group row'>
					<label class='col-xl-4 col-form-label' ng-attr-for='year_{{$ctrl.uniqueId}}'>Year</label>
					<div class='col'>
						{yearSelect}
					</div>
				</div>
			</fieldset>;
		}

		return (
			<div class={`input-group ${useNativeDatepicker ? '' : 'border'}`}>
				{useNativeDatepicker
					? undefined
					: (
						<p class='p-2 bg-light d-flex align-items-center w-100' style={'line-height:1rem;' as never}>
							<svg aria-hidden='true' style={'width:1rem;margin-right:0.69rem;' as never} role='img' viewBox='0 0 448 512'><path fill='currentColor' d='M148 288h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12zm108-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 96v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96-260v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48zm-48 346V160H48v298c0 3.3 2.7 6 6 6h340c3.3 0 6-2.7 6-6z'></path></svg>
							{'{{$ctrl.ngModel | date:"MMMM d, yyyy (EEEE)"}}'}
						</p>
					)}
				{input}
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
