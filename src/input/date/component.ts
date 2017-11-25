// tslint:disable:no-invalid-this
import { isFunction } from 'angular';
import { Callback } from '@ledge/types';

import { NgComponentController } from '../../controller';
import { InputComponentOptions } from '../../..';

class DateInputController extends NgComponentController {
	private hasFocus: boolean = false;
	private onChange: Callback;

	public $onInit() {
		if (typeof this.ngModel !== 'object') {
			this.ngModel = new Date(this.ngModel);
		} else if (this.ngModel == null) {
			this.ngModel = new Date(Date.now());
		}

		this.$scope.$watch(
			_ => this.ngModel,
			_ => {
				if (typeof _ !== 'object') {
					this.ngModel = new Date(_);
				} else if (_ == null) {
					this.ngModel = new Date(Date.now());
				}
			},
		);
	}

	public toggleDatepicker() {
		// tslint:disable-next-line:no-non-null-assertion
		const input = this.$element.querySelector('input')!;
		const hasFocus = this.hasFocus = !this.hasFocus;
		const method = hasFocus ? 'focus' : 'blur';

		input[method]();
	}

	public handleDateEvent() {
		if (this.onChange != null && isFunction(this.onChange)) {
			this.onChange(this.ngModel);
		}
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
			['ng-change', '$ctrl.handleDateEvent()'],
		]);

		return h.createIconInput(input, 'calendar', [
			['ng-click', '$ctrl.toggleDatepicker()'],
			['style', 'cursor:pointer'],
		]);
	},
	ctrl: DateInputController,
};
