(function() {
  'use strict';

  function bargraphDirective() {
    return {
      restrict: 'EA',
      scope: {},
      templateUrl: 'scripts/bargraph/bargraph.directive.html',
      controller: 'BarGraphController',
      controllerAs: 'bargraph',

      link: function(scope, element, attrs) {
        scope.bargraph.init(element[0], attrs);
      }
    };
  }

  angular.module('eWaterCycleApp.bargraph').directive('bargraphDirective', bargraphDirective);
})();
