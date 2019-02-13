import { NgController, makeInjectableCtrl } from '../../src/controller';
import { NgInputController } from '../../src/inputs';

import { $config } from './-config';
import { $injector } from './--injector';
import { $log } from './-logger';
import { $http } from './-http';

export { NgInputController };
export const $inputCtrl = new NgInputController();

const Ctrl = makeInjectableCtrl(NgController, { log: $log, http: $http, config: () => $config });
export const $scope = $injector.get('$rootScope').$new();
export const $element = $injector.get('$compile')(document.createElement('div'))($scope);
export const $ctrl = new Ctrl($element, $scope, $injector);
