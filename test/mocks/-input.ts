import { Attributes } from '../../src/controller';
import { $element } from './-controller';

export function makeAttrs(ngModel: string) {
	return new Attributes($element[0], { 'ng-model': ngModel });
}
