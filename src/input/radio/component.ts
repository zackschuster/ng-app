import { InputComponentOptions } from '../../..';

export const radioList: InputComponentOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	render(h) {
		const radio = h.createInput('radio');
		const value = this.$attrs.value || 'Value';

		radio.setAttribute('ng-value', `{{item.${value}}}`);
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

		const labelText = document.createTextNode(`{{item.${text}}}`);
		const spanTag = document.createElement('span');

		spanTag.appendChild(labelText);

		this.$label.setAttribute('for', '{{id}}{{$index}}');
		this.$label.appendChild(spanTag);
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
};
