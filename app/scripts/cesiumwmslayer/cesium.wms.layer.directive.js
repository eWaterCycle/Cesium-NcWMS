(function() {
  'use strict';

  function cesiumWmsLayerDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/cesiumwmslayer/cesium.wms.layer.directive.html',
      controller: 'CesiumWmsLayerController',
      controllerAs: 'cnl'
    };
  }

  angular.module('eWaterCycleApp.cesiumWmsLayer').directive('cesiumWmsLayerDirective', cesiumWmsLayerDirective);
})();