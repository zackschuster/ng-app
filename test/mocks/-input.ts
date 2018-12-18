export function makeAttrs(ngModel: string) {
	return {
		$normalize: () => '',
		$addClass: () => '',
		$removeClass: () => '',
		$updateClass() { return; },
		$set() { return; },
		$observe: () => function $observe() { return; },
		$attr: Object.create(null),
		ngModel,
	};
}
