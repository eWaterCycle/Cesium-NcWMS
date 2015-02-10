'use strict';

/**
 * @ngdoc overview
 * @name myYoEwaterCycleDemoApp
 * @description
 * # myYoEwaterCycleDemoApp
 *
 * Main module of the application.
 */
angular
  .module('myYoEwaterCycleDemoApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
