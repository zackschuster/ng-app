import { isFunction } from 'angular';
import { Callback } from '@ledge/types';

import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';

class DateInputController extends CoreInputController {
	private hasFocus: boolean = false;
	private onChange: Callback;

	/* @ngInject */
	constructor($scope: any, $element: any, $attrs: any) {
		super($scope, $element, $attrs);
	}

	public $postLink() {
		const $input = this.makeInput();

		$input.setAttribute('uib-datepicker-popup', 'MM/dd/yyyy');
		$input.setAttribute('datepicker-append-to-body', 'true');
		$input.setAttribute('is-open', '$ctrl.hasFocus');
		$input.setAttribute('ng-click', '$ctrl.hasFocus = true');
		$input.setAttribute('ng-change', '$ctrl.handleDateEvent()');

		this.wireToContainer('.input-group', $input).ngModel = new Date();
	}

	public toggleDatepicker() {
		const el = this.$element.find('input');
		const method = (this.hasFocus = !this.hasFocus) ? 'focus' : 'blur';

		el[method]();
	}

	public handleDateEvent() {
		if (this.onChange != null && isFunction(this.onChange)) {
			this.onChange(this.ngModel);
		}
	}
}

export const dateInput = applyCoreDefinition({
	render(h) {
		const inputGroup = h.createElement('div', ['input-group']);

		const inputGroupAddon = h.createElement('div', ['input-group-addon']);
		inputGroupAddon.setAttribute('ng-click', '$ctrl.toggleDatepicker()');

		const icon = h.createElement('span', ['glyphicon', 'glyphicon-calendar']);
		icon.setAttribute('aria-hidden', 'true');

		inputGroupAddon.appendChild(icon);
		inputGroup.appendChild(inputGroupAddon);

		return inputGroup;
	},
	controller: DateInputController,
});
