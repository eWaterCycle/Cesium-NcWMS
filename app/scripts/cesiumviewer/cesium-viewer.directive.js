(function() {
  'use strict';

    function cesiumViewerDirective() {
      return {
        restrict: 'E',
        templateUrl: 'scripts/cesiumviewer/cesium-viewer.directive.html',
        link: function(scope, element) {
          scope.cvc.init(element[0]);
        },
        controller: 'CesiumViewerController',
        controllerAs: 'cvc'
      };
    }

    angular.module('eWaterCycleApp.cesiumViewer').directive('cesiumViewerDirective', cesiumViewerDirective);
})();