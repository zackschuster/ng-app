import { IComponentOptions } from 'angular';

export const coreDefinition: IComponentOptions = {
	transclude: {
		include: '?include',
	},
	bindings: {
		ngModel: '=',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	},
};

export function applyCoreDefinition(definition: IComponentOptions) {
	const def = Object.assign({}, coreDefinition, definition);

	Object.assign(def.bindings, Object.assign(coreDefinition.bindings, definition.bindings));
	Object.assign(def.transclude, Object.assign(coreDefinition.transclude, definition.transclude));

	return def;
}
