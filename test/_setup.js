if (typeof module !== 'undefined' && module.exports) {
	require('browser-env')();
	require('angular/angular.js');
	global.angular = window.angular;
}
