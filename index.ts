import { Indexed } from '@ledge/types';
import { App } from 'core/app';

import * as input from 'core/input';
import * as layout from 'core/layout';
import * as mock from 'core/mock';

export const app = new App().addComponents({ ...input, ...layout });
export const config = app.config();

export interface ICoreModel extends Indexed {
	Id?: number;
	Description: string;
}

export { CoreController } from 'core/controller';
export { mock };
