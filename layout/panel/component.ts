import { copy } from 'angular';

class PanelController {
	public model: any;
	public original: any;
	public isEditing: boolean;

	public $onInit() {
		this.original = copy(this.model);
		this.isEditing = false;
	}

	public restore() {
		Object.assign(this.model, this.original);
		this.isEditing = false;
	}
}
export const editablePanel = {
	template: require('./template.pug')(),
	transclude: {
		headerView: 'headerView',
		headerEdit: 'headerEdit',
		bodyView: 'bodyView',
		bodyEdit: 'bodyEdit',
	},
	bindings: {
		model: '<',
		save: '&',
		delete: '&',
	},
	controller: PanelController,
};
