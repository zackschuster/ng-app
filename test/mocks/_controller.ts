import { NgComponentController, NgController } from '../../src/controller';
import { $prefix } from './_http';

export const $ctrl = new NgController();
export const $compCtrl = new NgComponentController();

($ctrl as any).apiPrefix = $prefix;
