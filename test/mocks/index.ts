import { $injector } from './--injector';

export * from './-controller';
export * from './-http';
export * from './-input';
export * from './-logger';
export * from './-modal';
export * from './-renderer';

export const $scope = $injector.get('$rootScope').$new();
export const $compile = $injector.get('$compile');
export const $toJqlite = (el: Element, scope = $scope) => $compile(el)(scope);

export function $invokeTemplate(template: any, $element: Element, $attrs: Partial<angular.IAttributes>) {
	return $injector.invoke(template, { }, { $element: $toJqlite($element), $attrs });
}
