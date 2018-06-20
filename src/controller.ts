import { IAttributes, INgModelController, IScope, ITimeoutService, auto } from 'angular';
import { NgLogger } from './logger';
import { NgDataService } from './http';
import { IConfig } from '@ledge/types';
import { StateService } from '@uirouter/angularjs';

export class NgController {
	protected readonly $config: IConfig;
	protected readonly $scope: IScope;
	protected readonly $element: HTMLElement;
	protected readonly $attrs: IAttributes;
	protected readonly $timeout: ITimeoutService;
	protected readonly $log: NgLogger;
	protected readonly $http: NgDataService;
	protected readonly $injector: auto.IInjectorService;
	protected readonly $state: StateService;

	protected readonly isProduction: boolean;
	protected readonly isDevelopment: boolean;
	protected readonly isStaging: boolean;
	protected readonly apiPrefix: boolean;

	protected openWebAddress(address: string) {
		this.$log.confirm(_ => {
			window.open(`http://${address}`);
		});
	}

	protected splitByCapitalLetter(item: string) {
		return item.split(/(?=[A-Z])/).map(x => x.charAt(0).toUpperCase() + x.substring(1)).join(' ');
	}

	protected getApiPrefix() {
		return this.apiPrefix;
	}
}

// tslint:disable-next-line:max-classes-per-file
export class NgComponentController extends NgController {
	public ngModel: any;
	public ngModelCtrl: INgModelController;

	// tslint:disable-next-line:no-non-null-assertion
	public uniqueId = crypto.getRandomValues(new Int8Array(2))!.toLocaleString().replace(/[-]|[,]/g, '');

}
