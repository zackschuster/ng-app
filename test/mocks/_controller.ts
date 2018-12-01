import { NgController } from '../../src/controller';
import { NgInputController } from '../../src/input/controller';

import { $prefix } from './_http';
import { $injector } from './__injector';

export { NgInputController };
export const $controller = $injector.get('$controller');
export const $ctrl = new NgController();
export const $compCtrl = new NgInputController();

($ctrl as any).apiPrefix = $prefix;
