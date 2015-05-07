(function() {
  'use strict';

  function sliderDirective() {
    return {
      restrict: 'E',
      scope: { layerId: '=' },
      templateUrl: 'scripts/slider/slider.directive.html',
      controller: 'SliderController',
      controllerAs: 'slider'
    };
  }

  angular.module('eWaterCycleApp.slider').directive('sliderDirective', sliderDirective);
})();
