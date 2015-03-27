(function() {
  'use strict';

  function linegraphDirective() {
    return {
      restrict: 'EA',
      scope: {
        data: '=',
        onClick: '&'  // parent execution binding
      },
      templateUrl: 'scripts/linegraph/linegraph.directive.html',
      controller: 'LineGraphController',
      controllerAs: 'linegraph',

      link: function(scope, element, attrs) {
        scope.linegraph.init(element[0], attrs);
      }
    };
  }

  angular.module('eWaterCycleApp.linegraph').directive('linegraphDirective', linegraphDirective);
})();
