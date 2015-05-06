(function() {
  'use strict';

    function LogarithmicController($scope, Messagebus) {
      this.logarithmic = [];

      this.toggleLogarithmic = function() {
        if (this.logarithmic[$scope.layerId] === undefined) {
          this.logarithmic[$scope.layerId] = true;
        } else {
          this.logarithmic[$scope.layerId] = !this.logarithmic[$scope.layerId];
        }
        Messagebus.publish('logarithmicChange', {'layerId':$scope.layerId, 'logarithmic':this.logarithmic[$scope.layerId]});
      };

      Messagebus.subscribe('logarithmicChange', function(event, value) {
        if (value.layerId === $scope.layerId && value.logarithmic !== this.logarithmic[$scope.layerId]) {
            this.logarithmic[$scope.layerId] = value.logarithmic;
        }
      }.bind(this));
    }

  angular.module('eWaterCycleApp.logarithmic').controller('LogarithmicController', LogarithmicController);
})();
