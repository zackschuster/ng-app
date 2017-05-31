import * as input from 'core/input';
import * as mock from 'core/mock';
import * as models from 'core/models';

import { NgApp } from 'core/ng/app';

export const app: models.IApp = new NgApp().registerComponents({ ...input });
export const { config, name } = app;

export { CoreController } from 'core/controller';
export { mock, models };
