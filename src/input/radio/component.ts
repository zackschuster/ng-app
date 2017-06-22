// tslint:disable:no-invalid-this
import { CoreInputController } from '../controller';
import { InputComponentOptions } from '../../..';

class RadioListController extends CoreInputController {
	public toggle(value: any) {
		// tslint:disable-next-line:triple-equals
		if (this.ngModel == value) {
			this.ngModel = null;
		} else {
			this.ngModel = value;
		}
	}
}

export const radioList: InputComponentOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	nestInputInLabel: true,
	render(h) {
		const radio = h.createInput('radio');

		radio.removeAttribute('ng-model');
		radio.setAttribute('ng-value', '{{item.Value}}');
		radio.setAttribute('ng-checked', '$ctrl.ngModel == item.Value');
		radio.setAttribute('ng-click', '$ctrl.toggle(item.Value)');

		if (this.$attrs.hasOwnProperty('inline')) {
			this.$template.classList.remove('form-check');
			this.$template.classList.add('form-check-inline');
		}

		this.$template.setAttribute('ng-repeat', 'item in $ctrl.list');

		return radio;
	},
	renderLabel() {
		const labelText = document.createTextNode('{{item.Text}}');
		const spanTag = document.createElement('span');

		spanTag.appendChild(labelText);

		this.$label.setAttribute('for', '{{id}}{{$index}}');
		this.$label.appendChild(spanTag);
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
	ctrl: RadioListController,
};
