import { Indexed } from '@ledge/types';
import { NgApp } from 'core/ng/app';

import * as input from 'core/input';
import * as layout from 'core/layout';
import * as mock from 'core/mock';

export const app = new NgApp().registerComponents({ ...input, ...layout });
export const { config, name } = app;

export interface ICoreModel extends Indexed {
	Id?: number;
	Description: string;
}

export { CoreController } from 'core/controller';
export { mock };
