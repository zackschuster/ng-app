import { NgDataService } from '../../src/http';
import { $injector } from './__injector';
import { logger } from './_logger';

export const http = new NgDataService($injector.get('$http'), logger, 'http://localhost:2323');
