import * as input from './src/input';

import { NgApp } from './src/ng/app';
import { IApp } from './types';

export const app: IApp = new NgApp().registerComponents(input as any);
export const { config, name } = app;

export { NgController } from './src/ng/controller';
export { NgRenderer } from './src/ng/renderer';
