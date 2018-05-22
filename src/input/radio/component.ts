import { InputComponentOptions } from '../../..';
import { NgComponentController } from '../../controller';

class RadioListController extends NgComponentController {
	// tslint:disable-next-line:no-non-null-assertion
	public nameId = crypto.getRandomValues(new Int8Array(1))!.toLocaleString();
}

export const radioList: InputComponentOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	render(h) {
		const radio = h.createInput('radio');
		const value = this.$attrs.value || 'Value';

		radio.setAttribute('ng-value', `item.${value}`);
		radio.setAttribute('ng-attr-name', 'RadioButton_{{$ctrl.nameId}}');
		radio.style.cursor = 'pointer';

		if (this.$attrs.hasOwnProperty('inline')) {
			this.$template.classList.remove('form-check');
			this.$template.classList.add('form-check-inline');
		}

		this.$template.setAttribute('ng-repeat', 'item in $ctrl.list');

		return radio;
	},
	renderLabel() {
		const text = this.$attrs.text || 'Text';
		const value = this.$attrs.value || 'Value';

		const labelText = document.createTextNode(`{{item.${text}}}`);
		const spanTag = document.createElement('span');

		spanTag.appendChild(labelText);

		this.$label.setAttribute('for', '{{id}}{{$index}}');
		this.$label.setAttribute('ng-click', `$ctrl.ngModel === item.${value}`);
		this.$label.appendChild(spanTag);
		this.$label.style.cursor = 'pointer';
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
	ctrl: RadioListController,
};
