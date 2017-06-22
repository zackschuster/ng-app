// tslint:disable:no-invalid-this
import { CoreInputController } from 'core/input/controller';
import { defineInputComponent } from 'core/input/definition';

class RadioListController extends CoreInputController {
	public $postLink() {
		this.$timeout(_ => {
			const el = document.querySelector('[ng-transclude="contain"]');
			if (el.innerHTML === '') {
				el.remove();
			}
		});
	}

	public toggle(value: any) {
		if (this.ngModel === value) {
			this.ngModel = null;
		} else {
			this.ngModel = value;
		}
	}
}

export const radioList = defineInputComponent({
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	nestInputInLabel: true,
	render(h) {
		const radio = h.createInput('radio');

		radio.removeAttribute('ng-model');
		radio.setAttribute('ng-value', '{{item.Value}}');
		radio.setAttribute('ng-checked', '$ctrl.ngModel == item.Value');
		radio.setAttribute('ng-click', '$ctrl.toggle(item.Value)');

		this.$template.setAttribute('ng-repeat', 'item in $ctrl.list');

		return radio;
	},
	renderLabel() {
		const label = this.$template.querySelector('label');
		const labelText = document.createTextNode('{{item.Text}}');
		const spanTag = document.createElement('span');

		spanTag.appendChild(labelText);
		label.setAttribute('for', '{{id}}{{$index}}');
		label.appendChild(spanTag);
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
	controller: RadioListController,
});