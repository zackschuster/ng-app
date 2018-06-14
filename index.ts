import * as inputs from './src/input';
import { NgApp } from './src/app';
import { NgComponentController, NgController } from './src/controller';
import { NgRenderer } from './src/renderer';

const $inputs = new Map(Object.entries(inputs));
export const app = new NgApp().registerComponents($inputs);

export function wrapCtrl(controller: new() => any) {
	return app._wrapComponentController(controller);
}

export { NgDataService } from './src/http';
export { NgLogger } from './src/logger';
export { NgModalOptions, NgModalService } from './src/modal';
export { NgController, NgComponentController, NgRenderer };
