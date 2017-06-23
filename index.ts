import * as $inputs from './src/input';

import { NgApp } from './src/ng/app';
import { IApp } from './types';

export const app: IApp = new NgApp().registerComponents($inputs as any);
export const { config, name } = app;

export { NgDataService } from './src/ng/http';
export { NgController } from './src/ng/controller';
export { NgRenderer } from './src/ng/renderer';
