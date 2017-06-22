// tslint:disable:no-invalid-this
import { defineInputComponent } from 'core/input/definition';

export const radioList = defineInputComponent({
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	nestInputInLabel: true,
	render(h) {
		const radio = h.createInput('radio');
		radio.setAttribute('ng-value', '{{item.Value}}');

		this.$template.setAttribute('ng-repeat', 'item in $ctrl.list');

		return radio;
	},
	renderLabel() {
		const labelText = document.createTextNode('{{item.Text}}');
		this.$template.querySelector('label').appendChild(labelText);
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
});
