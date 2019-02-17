import { NgController, makeInjectableCtrl } from '../../src/controller';

import { $config } from './-config';
import { $injector } from './--injector';
import { $log } from './-logger';
import { $http } from './-http';
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
