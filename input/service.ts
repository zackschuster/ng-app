import { IAttributes } from 'angular';
import { NgController } from 'core/ng/controller';

export class InputService extends NgController {
	private modelId: string;

	constructor(protected $attrs: IAttributes) {
		super();
	}

	public modelIdentifier(opts = { unique: true }) {
		return this.getId() + (opts.unique ? '_' + this.$scope.$id : '');
	}

	public getId() {
		if (this.modelId == null) {
			this.modelId = (this.$attrs.ngModel as string).split('.').pop();
		}
		return this.modelId;
	}

	public getIdForLabel() {
		return this.getId().split(/(?=[A-Z])/).join(' ');
	}

	public isSrOnly() {
		return this.$attrs.hasOwnProperty('srOnly');
	}

	public isInline() {
		return this.$attrs.hasOwnProperty('inline');
	}
}
