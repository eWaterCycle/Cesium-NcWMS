(function() {
  'use strict';

  function paletteDropdownDirective() {
    return {
      restrict: 'E',
      scope: { layerId: '=' },
      templateUrl: 'scripts/palette/palette.directive.html',
      controller: 'PaletteController',
      controllerAs: 'pal'
    };
  }

  angular.module('eWaterCycleApp.palette').directive('paletteDropdownDirective', paletteDropdownDirective);
})();
