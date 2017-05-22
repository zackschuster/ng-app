export const editablePanel = {
	template: require('./template.pug')(),
	transclude: {
		bodyView: 'bodyView',
		editView: 'editView',
	},
	bindings: {
		ngModel: '<',
		save: '<',
	},
};
