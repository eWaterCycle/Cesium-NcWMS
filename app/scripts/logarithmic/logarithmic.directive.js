(function() {
  'use strict';

  function logarithmicToggleDirective() {
    return {
      restrict: 'E',
      scope: { layerId: '=' },
      templateUrl: 'scripts/logarithmic/logarithmic.directive.html',
      controller: 'LogarithmicController',
      controllerAs: 'lc'
    };
  }

  angular.module('eWaterCycleApp.logarithmic').directive('logarithmicToggleDirective', logarithmicToggleDirective);
})();
