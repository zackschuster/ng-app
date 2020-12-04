import { h } from '@ledge/jsx';
import { NgInputController, NgInputOptions, closest } from './shared';

class RadioListController extends NgInputController {
	public $postLink() {
		setTimeout(() => {
			if (this.$attrs.hasOwnProperty('required')) {
				closest(this.$element, 'fieldset')
					?.querySelector('legend')
					?.appendChild(<span class='text-danger'> *</span>);
			}
		});
	}
}

export const radioList: NgInputOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	render() {
		if (this.$attrs.hasOwnProperty('inline')) {
			this.$template.classList.remove('form-check');
			this.$template.classList.add('form-check-inline');
		}

		this.$template.setAttribute('ng-repeat', 'item in $ctrl.list track by $index');

		const ngValue = `item.${this.$attrs.value ?? 'Value'}`.replace(/[.]$/, '');
		return <input class='form-check-input' ng-value={ngValue} type='radio' />;
	},
	renderLabel() {
		const labelText = `{{item${`.${this.$attrs.text ?? 'Text'}`.replace(/[.]$/, '')}}}`;
		this.$label.appendChild(document.createTextNode(labelText));
		this.$label.setAttribute('ng-attr-for', '{{id}}_{{$ctrl.uniqueId}}_{{$index}}');
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
	controller: RadioListController,
};
