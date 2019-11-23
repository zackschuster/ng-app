import { NgController } from '../../src/controller';
import { NgInputController } from '../../src/inputs';

import { $prefix } from './--app';
import { $injector } from './--injector';

export { NgInputController };
export const $controller = $injector.get('$controller');
export const $ctrl = new NgController();
export const $inputCtrl = new NgInputController();

($ctrl as any).apiPrefix = $prefix;
