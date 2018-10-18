import * as inputs from './src/input';
import { NgApp } from './src/app';

export const app = new NgApp().registerComponents(inputs);

export function wrapCtrl(controller: new() => any) {
	return app._wrapComponentController(controller);
}

export * from './src/app';
export * from './src/service';
export * from './src/controller';
export * from './src/http';
export * from './src/logger';
export * from './src/modal';
export * from './src/renderer';
export * from './src/router';
export * from './src/input';
