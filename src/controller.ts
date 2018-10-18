// tslint:disable:max-classes-per-file
import { NgLogger } from './logger';
import { NgDataService } from './http';
import { NgService } from './service';
import { NgStateService } from './router';
import { NgConfig } from './app';

export class NgController extends NgService {
	protected readonly $scope: angular.IScope;
	protected readonly $attrs: angular.IAttributes;
	protected readonly $timeout: angular.ITimeoutService;
	protected readonly $injector: angular.auto.IInjectorService;

	protected readonly $config: NgConfig;
	protected readonly $log: NgLogger;
	protected readonly $http: NgDataService;
	protected readonly $state: NgStateService;
	protected readonly $element: HTMLElement;

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
