(function() {
  'use strict';

    function SliderController($scope, Messagebus) {
      this.opacity = [];

      //Subscribe to the message bus for changes to this value.
      Messagebus.subscribe('opacityChange', function(event, value) {
        if (value.layerId === $scope.layerId && value.opacity !== this.opacity[$scope.layerId]) {
            this.opacity[$scope.layerId] = value.opacity;
        }
      }.bind(this));

      this.opacityChange = function() {
        Messagebus.publish('opacityChange', {'layerId':$scope.layerId, 'opacity':this.opacity[$scope.layerId]});
      };

    }

  angular.module('eWaterCycleApp.slider').controller('SliderController', SliderController);
})();
