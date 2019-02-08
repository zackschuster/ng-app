import isIE11 from '@ledge/is-ie-11';

export class NgService {
	public static IsMobile() {
		return typeof window === 'object' && window.innerWidth < 767;
	}

	public static IsIE11() {
		return isIE11();
	}

	/**
	 * @see https://stackoverflow.com/a/2117523
	 */
	public static UUIDv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
			// tslint:disable:no-bitwise
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			// tslint:enable:no-bitwise
			return v.toString(16);
		});
	}

	protected get isMobile() {
		return NgService.IsMobile();
	}

	protected get isIE11() {
		return NgService.IsIE11();
	}

	// 	/**
	// 	 * @ngdoc function
	// 	 * @name angular.copy
	// 	 * @module ng
	// 	 * @kind function
	// 	 *
	// 	 * @description
	// 	 * Creates a deep copy of `source`, which should be an object or an array.
	// 	 *
	// 	 * * If no destination is supplied, a copy of the object or array is created.
	// 	 * * If a destination is provided, all of its elements (for arrays) or properties (for objects)
	// 	 *   are deleted and then all elements/properties from the source are copied to it.
	// 	 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
	// 	 * * If `source` is identical to `destination` an exception will be thrown.
	// 	 *
	// 	 * <br />
	// 	 * <div class="alert alert-warning">
	// 	 *   Only enumerable properties are taken into account. Non-enumerable properties (both on `source`
	// 	 *   and on `destination`) will be ignored.
	// 	 * </div>
	// 	 *
	// 	 * @param {*} source The source that will be used to make a copy.
	// 	 *                   Can be any type, including primitives, `null`, and `undefined`.
	// 	 * @param {(Object|Array)=} destination Destination into which the source is copied. If
	// 	 *     provided, must be of the same type as `source`.
	// 	 * @returns {*} The copy or updated `destination`, if `destination` was specified.
	// 	 *
	// 	 * @example
	// 		<example module="copyExample" name="angular-copy">
	// 			<file name="index.html">
	// 				<div ng-controller="ExampleController">
	// 					<form novalidate class="simple-form">
	// 						<label>Name: <input type="text" ng-model="user.name" /></label><br />
	// 						<label>Age:  <input type="number" ng-model="user.age" /></label><br />
	// 						Gender: <label><input type="radio" ng-model="user.gender" value="male" />male</label>
	// 										<label><input type="radio" ng-model="user.gender" value="female" />female</label><br />
	// 						<button ng-click="reset()">RESET</button>
	// 						<button ng-click="update(user)">SAVE</button>
	// 					</form>
	// 					<pre>form = {{user | json}}</pre>
	// 					<pre>leader = {{leader | json}}</pre>
	// 				</div>
	// 			</file>
	// 			<file name="script.js">
	// 				// Module: copyExample
	// 				angular.
	// 					module('copyExample', []).
	// 					controller('ExampleController', ['$scope', function($scope) {
	// 						$scope.leader = {};
	// 						$scope.reset = function() {
	// 							// Example with 1 argument
	// 							$scope.user = angular.copy($scope.leader);
	// 						};
	// 						$scope.update = function(user) {
	// 							// Example with 2 arguments
	// 							angular.copy(user, $scope.leader);
	// 						};
	// 						$scope.reset();
	// 					}]);
	// 			</file>
	// 		</example>
	// 	*/
	// public copy<T, Y>(source: T[], destination: T[], maxDepth = NaN) {
	//   var stackSource = [];
	//   var stackDest = [];

	//   if (destination) {
	//     if (isTypedArray(destination) || isArrayBuffer(destination)) {
	//       throw ngMinErr('cpta', 'Can\'t copy! TypedArray destination cannot be mutated.');
	//     }
	//     if (source === destination) {
	//       throw ngMinErr('cpi', 'Can\'t copy! Source and destination are identical.');
	//     }

	//     // Empty the destination object
	//     if (isArray(destination)) {
	// 			destination.length = 0;
	// 		} else {
	// 			forEach(destination, function(value, key) {
	// 				if (key !== '$$hashKey') {
	// 					delete destination[key];
	// 				}
	// 			});
	// 		}

	// 		stackSource.push(source);
	// 		stackDest.push(destination);
	// 		return copyRecurse(source, destination, maxDepth);
	// 	}

	// 	 return copyElement(source, maxDepth);

	// 	 function copyRecurse(source, destination, maxDepth) {
	// 		maxDepth--;
	// 		if (maxDepth < 0) {
	// 			return '...';
	// 		}
	// 		const h = destination.$$hashKey;
	// 		let key;
	// 		if (isArray(source)) {
	// 			for (let i = 0, ii = source.length; i < ii; i++) {
	// 				destination.push(copyElement(source[i], maxDepth));
	// 			}
	// 		} else if (isBlankObject(source)) {
	// 			// createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
	// 			for (key in source) {
	// 				destination[key] = copyElement(source[key], maxDepth);
	// 			}
	// 		} else if (source && typeof source.hasOwnProperty === 'function') {
	// 			// Slow path, which must rely on hasOwnProperty
	// 			for (key in source) {
	// 				if (source.hasOwnProperty(key)) {
	// 					destination[key] = copyElement(source[key], maxDepth);
	// 				}
	// 			}
	// 		} else {
	// 			// Slowest path --- hasOwnProperty can't be called as a method
	// 			for (key in source) {
	// 				if (hasOwnProperty.call(source, key)) {
	// 					destination[key] = copyElement(source[key], maxDepth);
	// 				}
	// 			}
	// 		}
	// 		setHashKey(destination, h);
	// 		return destination;
	// 	}

	// 	 function copyElement(source, maxDepth) {
	// 		// Simple values
	// 		if (!isObject(source)) {
	// 			return source;
	// 		}

	// 		// Already copied values
	// 		const index = stackSource.indexOf(source);
	// 		if (index !== -1) {
	// 			return stackDest[index];
	// 		}

	// 		if (isWindow(source) || isScope(source)) {
	// 			throw ngMinErr('cpws',
	// 				'Can\'t copy! Making copies of Window or Scope instances is not supported.');
	// 		}

	// 		let needsRecurse = false;
	// 		let destination = copyType(source);

	// 		if (destination === undefined) {
	// 			destination = isArray(source) ? [] : Object.create(getPrototypeOf(source));
	// 			needsRecurse = true;
	// 		}

	// 		stackSource.push(source);
	// 		stackDest.push(destination);

	// 		return needsRecurse
	// 			? copyRecurse(source, destination, maxDepth)
	// 			: destination;
	// 	}

	// 	 function copyType(source) {
	// 		switch (toString.call(source)) {
	// 			case '[object Int8Array]':
	// 			case '[object Int16Array]':
	// 			case '[object Int32Array]':
	// 			case '[object Float32Array]':
	// 			case '[object Float64Array]':
	// 			case '[object Uint8Array]':
	// 			case '[object Uint8ClampedArray]':
	// 			case '[object Uint16Array]':
	// 			case '[object Uint32Array]':
	// 				return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);

	// 			case '[object ArrayBuffer]':
	// 				// Support: IE10
	// 				if (!source.slice) {
	// 					// If we're in this case we know the environment supports ArrayBuffer
	// 					/* eslint-disable no-undef */
	// 					const copied = new ArrayBuffer(source.byteLength);
	// 					new Uint8Array(copied).set(new Uint8Array(source));
	// 					/* eslint-enable */
	// 					return copied;
	// 				}
	// 				return source.slice(0);

	// 			case '[object Boolean]':
	// 			case '[object Number]':
	// 			case '[object String]':
	// 			case '[object Date]':
	// 				return new source.constructor(source.valueOf());

	// 			case '[object RegExp]':
	// 				const re = new RegExp(source.source, source.toString().match(/[^/]*$/)[0]);
	// 				re.lastIndex = source.lastIndex;
	// 				return re;

	// 			case '[object Blob]':
	// 				return new source.constructor([source], { type: source.type});
	// 		}

	// 		if (isFunction(source.cloneNode)) {
	// 			return source.cloneNode(true);
	// 		}
	// 	}
	// }

	// // eslint-disable-next-line no-self-compare
	// function simpleCompare(a, b) { return a === b || (a !== a && b !== b); }
	/**
	 * Separates words in a string by capital letters. Also capitalizes the first letter.
	 *
	 * The following exceptions apply:
	 * 1) If string is all-caps, it's returned as-is
	 * 2) Any embedded acronyms (such as F.A.Q.) are returned as-is
	 * 3) Consecutive capital letters are returned as-is
	 * 3) Hyphenated words retain concatenation
	 *
	 * @param item - The string value to be split
	 */
	public splitByCapitalLetter(item: string) {
		const split = item.split(/(?=[A-Z])/);
		return split.every(x => x.length === 1)
			? item
			: split
				.map(x => x.trim())
				.map(x =>
					x.length === 1 || (x.length === 2 && x.charAt(1) === '.')
						? (x.toUpperCase() + '\uFFFF')
						: (x.charAt(0).toUpperCase() + x.substring(1)),
				)
				.join(' ')
				.replace(
					/\w{1}\.?(\uFFFF){1}\s?/g,
					([first, second]) =>
						second === '.'
							? first + second
							: first,
				)
				.replace(
					/\.{1}\w{2,}/g,
					([first, second, ...rest]) =>
						`${first} ${second.toUpperCase()}${rest.join('')}`,
				)
				.replace(/- /g, '-');
	}
}
