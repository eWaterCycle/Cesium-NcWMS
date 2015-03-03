(function() {
  'use strict';

  function logoBoxDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/logos/logos.directive.html'
    };
  }

  angular.module('eWaterCycleApp.logos').directive('logoBoxDirective', logoBoxDirective);
})();