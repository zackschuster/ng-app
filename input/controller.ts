import { IAttributes } from 'angular';
import { NgRenderer } from 'core/ng/renderer';

export class CoreInputController extends NgRenderer {
	protected ngModel: any;

	constructor(protected $attrs: IAttributes) {
		super();

		this.$scope.required = $attrs.hasOwnProperty('required');
		this.$scope.disabled = $attrs.hasOwnProperty('disabled');
		this.$scope.readonly = $attrs.hasOwnProperty('readonly');
	}

	protected getInput() {
		return this.$element.find(`input#${this.modelIdentifier(this.$attrs)}`);
	}
}
