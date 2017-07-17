import { IAttributes, IPromise, IQService, IScope, ITimeoutService, auto } from 'angular';
import { IStateService } from 'angular-ui-router';
import { NgLogger } from './logger';
import { NgDataService } from './http';

export class NgController {
	public $scope: IScope;
	public $element: JQuery;
	public $attrs: IAttributes;
	public $timeout: ITimeoutService;
	public $log: NgLogger;
	public $http: NgDataService;
	public $injector: auto.IInjectorService;
	public $state: IStateService;
	public $promise: IQService;
	public $resolve: <T>(value: T | IPromise<T>) => IPromise<T>;
	public ngModel: any;
}
