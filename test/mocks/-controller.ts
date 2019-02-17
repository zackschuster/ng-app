import { NgController, makeInjectableCtrl } from '../../src/controller';

import { $injector } from './--injector';
import { $config } from './--app';
import { $http } from './-http';
import { $log } from './-logger';
import { $renderer } from './-renderer';

const Ctrl = makeInjectableCtrl(NgController, {
	log: $log,
	http: $http,
	renderer: $renderer,
	config: () => $config,
});
export const $scope = $injector.get('$rootScope').$new();
export const $element = $injector.get('$compile')(document.createElement('div'))($scope);
export const $ctrl = new Ctrl($element, $scope, $injector);
