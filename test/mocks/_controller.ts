import { NgComponentController, NgController } from '../../src/controller';
import { $prefix } from './_http';
import { $injector } from './__injector';

export { NgComponentController };
export const $controller = $injector.get('$controller');
export const $ctrl = new NgController();
export const $compCtrl = new NgComponentController();

($ctrl as any).apiPrefix = $prefix;
