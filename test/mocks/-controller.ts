import { NgComponentController, NgController } from '../../src/controller';
import { $prefix } from './-http';
import { $injector } from './--injector';

export { NgComponentController };
export const $controller = $injector.get('$controller');
export const $ctrl = new (class extends NgController {})();
// tslint:disable-next-line:max-classes-per-file
export const $compCtrl = new (class extends NgComponentController {})();

($ctrl as any).apiPrefix = $prefix;
