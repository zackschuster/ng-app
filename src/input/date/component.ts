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
		this.$timeout();
	}

	public toggleDatepicker() {
		const input = (this.$element.find('input') as any)[0] as HTMLInputElement;
		const method = (this.hasFocus = !this.hasFocus) ? 'focus' : 'blur';

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
			// tslint:disable-next-line:no-invalid-this
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
