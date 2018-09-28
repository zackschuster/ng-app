// tslint:disable:max-classes-per-file
import { IConfig } from '@ledge/types';
import { StateService } from '@uirouter/angularjs';
import { NgLogger } from './logger';
import { NgDataService } from './http';
import { NgService } from './service';

export class NgController extends NgService {
	protected readonly $config: IConfig;
	protected readonly $scope: angular.IScope;
	protected readonly $element: HTMLElement;
	protected readonly $attrs: angular.IAttributes;
	protected readonly $timeout: angular.ITimeoutService;
	protected readonly $log: NgLogger;
	protected readonly $http: NgDataService;
	protected readonly $injector: angular.auto.IInjectorService;
	protected readonly $state: StateService;

	protected readonly isProduction: boolean;
	protected readonly isDevelopment: boolean;
	protected readonly isStaging: boolean;
	protected readonly apiPrefix: string;

	public openWebAddress(address: string) {
		this.$log.confirm(_ => {
			window.open(`http://${address}`);
		});
	}

	public getApiPrefix() {
		return this.apiPrefix;
	}
}

export class NgComponentController extends NgController {
	public ngModel: any;
	public ngModelCtrl: angular.INgModelController;

	// tslint:disable-next-line:no-non-null-assertion
	public uniqueId = crypto.getRandomValues(new Int8Array(2))!.toLocaleString().replace(/[-]|[,]/g, '');
}
