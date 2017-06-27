import { isFunction } from 'angular';
import { Callback } from '@ledge/types';

import { CoreInputController } from '../controller';
import { InputComponentOptions } from '../../../types';

class DateInputController extends CoreInputController {
	private hasFocus: boolean = false;
	private onChange: Callback;

	constructor() {
		super();

		this.ngModel = new Date();
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
		const inputGroup = h.createElement('div', ['input-group']);
		const inputGroupAddon = h.createElement('span', ['input-group-addon'], [
			['ng-click', '$ctrl.toggleDatepicker()'],
			['style', 'cursor:pointer'],
		]);

		const input = h.createInput('text', [
			['uib-datepicker-popup', 'MM/dd/yyyy'],
			['datepicker-append-to-body', 'true'],
			['is-open', '$ctrl.hasFocus'],
			['ng-click', '$ctrl.hasFocus = true'],
			['ng-change', '$ctrl.handleDateEvent()'],
		]);

		const icon = h.createIcon('calendar');

		inputGroupAddon.appendChild(icon);
		inputGroup.appendChild(inputGroupAddon);
		inputGroup.appendChild(input);

		return inputGroup;
	},
	ctrl: DateInputController,
};
