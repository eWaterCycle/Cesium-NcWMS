(function() {
  'use strict';

  function datasetDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/dataset/dataset.directive.html',
      controller: 'DatasetController',
      controllerAs: 'ds'
    };
  }

  angular.module('eWaterCycleApp.dataset').directive('datasetDirective', datasetDirective);
})();