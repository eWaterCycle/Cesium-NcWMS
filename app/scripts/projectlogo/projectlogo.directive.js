(function() {
  'use strict';

  function projectLogoBoxDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/projectlogo/projectlogo.directive.html'
    };
  }

  angular.module('eWaterCycleApp.projectlogo').directive('projectLogoBoxDirective', projectLogoBoxDirective);
})();