(function() {
  'use strict';

  function outlinesToggleDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/outlines/outlines.directive.html',
      controller: 'OutlinesController',
      controllerAs: 'ol'
    };
  }

  angular.module('eWaterCycleApp.outlines').directive('outlinesToggleDirective', outlinesToggleDirective);
})();