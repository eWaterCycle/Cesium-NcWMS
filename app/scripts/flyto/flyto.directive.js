(function() {
  'use strict';

  function cesiumFlyToDropdownDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/flyto/flyto.directive.html',
      controller: 'FlyToController',
      controllerAs: 'fdd'
    };
  }

  angular.module('eWaterCycleApp.flyTo').directive('cesiumFlyToDropdownDirective', cesiumFlyToDropdownDirective);
})();