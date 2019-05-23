import { InputComponentOptions } from '../options';
import { NgComponentController } from '../../controller';

class DateInputController extends NgComponentController {
	private hasFocus: boolean = false;
	private lastClick: number;
	private minDate: Date | number | string | null;
	private maxDate: Date | number | string | null;

	public $onInit() {
		function isNumber(n: any): n is number {
			return Number.isInteger(n);
		}

		this.ngModelCtrl.$validators.minDate = modelVal => {
			if (modelVal != null && isNumber(this.minDate)) {
				return this.minDate <= modelVal.valueOf();
			}
			return true;
		};

		this.ngModelCtrl.$validators.maxDate = modelVal => {
			if (modelVal != null && isNumber(this.maxDate)) {
				return this.maxDate >= modelVal.valueOf();
			}
			return true;
		};

		this.$scope.$watch(
			_ => this.ngModel,
			_ => {
				if ((_ instanceof Date) === false && typeof _ !== 'object') {
					this.ngModel = new Date(_);
				}
			},
		);

		this.$scope.$watch(
			_ => this.minDate,
			_ => {
				if (_ instanceof Date) {
					this.minDate = _.valueOf();
				} else if (typeof _ === 'string') {
					this.minDate = Date.parse(_);
					if (Number.isNaN(this.minDate)) {
						this.$log.devWarning('Min value cannot be parsed as a date. Setting to null.');
						this.minDate = null;
					}
				}
			},
		);

		this.$scope.$watch(
			_ => this.maxDate,
			_ => {
				if (_ instanceof Date) {
					this.maxDate = _.valueOf();
				} else if (typeof _ === 'string') {
					this.maxDate = Date.parse(_);
					if (Number.isNaN(this.maxDate)) {
						this.$log.devWarning('Max value cannot be parsed as a date. Setting to null.');
						this.maxDate = null;
					}
				}
			},
		);
	}

	public toggleDatepicker($event: any) {
		if ($event.timeStamp - this.lastClick < 50) {
			return;
		}
		this.lastClick = $event.timeStamp;

		const input = this.$element.querySelector('input') as HTMLInputElement;
		const hasFocus = this.hasFocus = !this.hasFocus;
		const method = hasFocus ? 'focus' : 'blur';

		input[method]();
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
			['uib-datepicker-popup', 'MM/dd/yyyy'],
			['datepicker-append-to-body', this.$attrs.appendToBody || 'false'],
			['is-open', '$ctrl.hasFocus'],
			['ng-click', '$ctrl.hasFocus = true'],
		]);

		return h.createIconInput(input, 'calendar', [
			['ng-click', '$ctrl.toggleDatepicker($event)'],
			['ng-model-options', '{ allowInvalid: true }'],
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
