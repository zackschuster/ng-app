import { app } from '../../index';

export abstract class NgController {
	constructor(
		protected $element = app.root() as JQuery,
		protected $scope = app.scope(),
		protected $timeout = app.timeout(),
		protected $log = app.logger(),
	) {}
}
