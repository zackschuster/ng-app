import { IComponentOptions, isFunction } from 'angular';
import { Callback } from '@ledge/types';

export const coreDefinition: IComponentOptions = {
	transclude: {
		contain: '?contain',
	},
	bindings: {
		ngModel: '=',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	},
};

interface IApplyCoreDefOpts {
	class?: string;
	slot?: string;
}

// tslint:disable-next-line:max-line-length
export function applyCoreDefinition(definition: IComponentOptions, options: IApplyCoreDefOpts = { class: 'form-group' }) {
	// flamethrower approach: blow up everything, then fix the stragglers
	const def = Object.assign({}, coreDefinition, definition);

	// assign template
	const { template } = def;
	const $baseEl = $(`<div class=${options.class}></div>`);

	$baseEl.html(isFunction(template) ? (template as Callback)() : '');
	$baseEl.prepend('<label ng-transclude></label>');

	def.template = $baseEl[0].outerHTML;

	if (options.slot) {
		$baseEl.append(`<div style="padding-top:0.32em;" ng-transclude="${options.slot}"></div>`);
	}

	// assign child objects
	Object.assign(def.bindings, Object.assign(coreDefinition.bindings, definition.bindings));
	Object.assign(def.transclude, Object.assign(coreDefinition.transclude, definition.transclude));

	return def;
}
