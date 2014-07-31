'use strict';

/**
 * @ngdoc overview
 * @name pattyVis2App
 * @description # pattyVis2App
 * 
 * Main module of the application.
 */
angular.module('pattyVis2App', [ 'ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch' ]).config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl : 'views/main.html',
		controller : 'MainCtrl'
	}).when('/about', {
		templateUrl : 'views/about.html',
		controller : 'AboutCtrl'
	}).otherwise({
		redirectTo : '/'
	});
});
