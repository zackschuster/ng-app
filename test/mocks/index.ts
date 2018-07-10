import { $injector } from './__injector';

export * from './_controller';
export * from './_http';
export * from './_input';
export * from './_logger';
export * from './_modal';
export * from './_renderer';

export const $scope = $injector.get('$rootScope').$new();
export const $element = $injector.get('$compile')
	(document.createElement('div'))
	($scope);

export function $invokeTemplate(template: any, $attrs: Partial<angular.IAttributes>) {
	return $injector.invoke(template, {}, { $element, $attrs });
}
