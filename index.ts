import { Indexed } from '@ledge/types';
import { App } from 'core/app';

import * as input from 'core/input';
import * as layout from 'core/layout';

const app = new App().addComponents({ ...input, ...layout });

interface ICoreModel extends Indexed {
	Id?: number;
	Description: string;
}

export { CoreController } from 'core/controller';
export { ICoreModel, app };
