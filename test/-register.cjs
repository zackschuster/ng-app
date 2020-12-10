// tslint:disable:no-var-requires
globalThis.angular = window.angular;

// run tests against bundle (intended for prepublishOnly script)
if (process.title === '../build/ng-app.cjs') {
	require(process.title);
	require.cache[require.resolve('../index.ts')] = require.cache[require.resolve(process.title)];
} else {
	require('@uirouter/angularjs');
}
