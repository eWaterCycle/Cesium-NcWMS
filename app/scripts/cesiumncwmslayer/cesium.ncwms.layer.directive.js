(function() {
  'use strict';

  function cesiumNcwmsLayerDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/cesiumncwmslayer/cesium.ncwms.layer.directive.html',
      controller: 'CesiumNcwmsLayerController',
      controllerAs: 'cnl'
    };
  }

  angular.module('eWaterCycleApp.cesiumNcwmsLayer').directive('cesiumNcwmsLayerDirective', cesiumNcwmsLayerDirective);
})();