import { IAttributes } from 'angular';
import { InputService } from 'core/input/service';

export class CoreInputController extends InputService {
	protected ngModel: any;

	constructor($attrs: IAttributes) {
		super($attrs);

		this.$scope.required = $attrs.hasOwnProperty('required');
		this.$scope.disabled = $attrs.hasOwnProperty('disabled');
		this.$scope.readonly = $attrs.hasOwnProperty('readonly');
	}
}
