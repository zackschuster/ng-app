import { NgAttributes } from '../../src/attributes';
import { $element } from './-controller';

export function makeAttrs(ngModel: string) {
	return new NgAttributes($element[0], { 'ng-model': ngModel });
}
