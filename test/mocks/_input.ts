export function makeAttrs(ngModel: string) {
	return {
		$normalize: () => '',
		$addClass: () => '',
		$removeClass: () => '',
		$updateClass() { return; },
		$set() { return; },
		$observe: () => new Function(),
		$attr: Object.create(null),
		ngModel,
	};
}
