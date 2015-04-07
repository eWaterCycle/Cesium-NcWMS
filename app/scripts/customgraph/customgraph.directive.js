(function() {
  'use strict';

  function customgraphDirective() {
    return {
      restrict: 'EA',
      scope: {
        data: '=',
        onClick: '&'  // parent execution binding
      },
      templateUrl: 'scripts/customgraph/customgraph.directive.html',
      controller: 'CustomGraphController',
      controllerAs: 'customgraph',

      link: function(scope, element, attrs) {
        scope.customgraph.init(element[0], attrs);
      }
    };
  }

  angular.module('eWaterCycleApp.customgraph').directive('customgraphDirective', customgraphDirective);
})();
