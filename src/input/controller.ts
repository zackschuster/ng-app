import { NgController } from '../controller';
import { NgService } from '../services';

export abstract class NgInputController extends NgController {
	public ngModel: any;
	public ngModelCtrl: angular.INgModelController;
	public uniqueId = NgService.UUIDv4().replace(/[-]|[,]/g, '');
}
