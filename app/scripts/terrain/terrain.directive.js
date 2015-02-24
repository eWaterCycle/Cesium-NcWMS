(function() {
  'use strict';

  function terrainToggleDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/terrain/terrain.directive.html',
      controller: 'TerrainController',
      controllerAs: 'tr'
    };
  }

  angular.module('eWaterCycleApp.terrain').directive('terrainToggleDirective', terrainToggleDirective);
})();