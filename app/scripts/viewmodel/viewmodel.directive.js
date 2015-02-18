(function() {
  'use strict';

  function cesiumViewmodelDropdownDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/viewmodel/viewmodel.directive.html',
      controller: 'ViewmodelController',
      controllerAs: 'vm'
    };
  }

  angular.module('eWaterCycleApp.viewmodel').directive('cesiumViewmodelDropdownDirective', cesiumViewmodelDropdownDirective);
})();