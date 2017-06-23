import * as inputs from './src/input';
import { NgApp } from './src/app';

const $inputs = new Map(Object.entries(inputs));
export const app = new NgApp()
	.registerComponents($inputs);

export { NgDataService } from './src/http';
export { NgLogger } from './src/logger';
export { NgController } from './src/controller';
export { NgRenderer } from './src/renderer';
