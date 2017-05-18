import * as angular from 'angular';

import { DataService } from 'app/core/data.service';
import { Logger } from 'app/core/logger';

export default
	angular
		.module('core', [])
		.service('dataService', DataService)
		.service('logger', Logger);
