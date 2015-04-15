(function() {
  'use strict';

  function styleDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/style/style.directive.html',
      controller: 'StyleController',
      controllerAs: 'stl'
    };
  }

  angular.module('eWaterCycleApp.style').directive('styleDirective', styleDirective);
})();
