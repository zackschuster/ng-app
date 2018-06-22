if (typeof module !== 'undefined' && module.exports) {
	require('browser-env')({ resources: 'usable' });
	require('angular/angular.js');
	require('angular-mocks');
	global.angular = window.angular;
	require('angular-ui-bootstrap');
}
