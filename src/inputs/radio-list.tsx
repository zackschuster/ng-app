import { h } from '../render';
import { NgInputController, NgInputOptions } from './shared';

class RadioListController extends NgInputController {
	public $postLink() {
		setTimeout(() => {
			if (this.$attrs.hasOwnProperty('required')) {
				this.$element.closest('fieldset')
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
		const { value = 'Value' } = this.$attrs;
		const radio =
			<input class='form-check-input'
				ng-attr-name='{{id}}_{{$ctrl.uniqueId}}'
				ng-model='$ctrl.ngModel'
				ng-model-options='$ctrl.ngModelOptions'
				type='radio'
				ng-value={`item.${value}`}
				ng-attr-id='{{id}}_{{$ctrl.uniqueId}}_{{$index}}'
				style={'cursor: pointer;' as never}
			/>;

		if (this.$attrs.hasOwnProperty('inline')) {
			this.$template.classList.remove('form-check');
			this.$template.classList.add('form-check-inline');
		}

		this.$template.setAttribute('ng-repeat', 'item in $ctrl.list track by $index');

		return radio;
	},
	renderLabel() {
		const { text = 'Text' } = this.$attrs;
		const labelText = document.createTextNode(`{{item.${text}}}`);

		this.$label.appendChild(labelText);
		this.$label.setAttribute('ng-attr-for', '{{id}}_{{$ctrl.uniqueId}}_{{$index}}');
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
	controller: RadioListController,
};
