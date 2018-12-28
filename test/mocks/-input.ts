export function makeAttrs(ngModel: string) {
	return {
		$normalize: () => '',
		$addClass: () => '',
		$removeClass: () => '',
		$updateClass() { return; },
		$set() { return; },
		$observe: () => function noop() { return; },
		$attr: Object.create(null),
		ngModel,
	};
}
