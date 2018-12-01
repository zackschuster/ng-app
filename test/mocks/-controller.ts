import { NgController } from '../../src/controller';
import { NgInputController } from '../../src/input/controller';

import { $prefix } from './-http';
import { $injector } from './--injector';

export { NgInputController };
export const $controller = $injector.get('$controller');
export const $ctrl = new (class extends NgController { })();
export const $compCtrl = new (class extends NgInputController { })();

($ctrl as any).apiPrefix = $prefix;
