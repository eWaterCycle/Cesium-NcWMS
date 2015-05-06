(function() {
  'use strict';

    function StyleController($scope, NcwmsService, Messagebus) {
      this.getNcWMSdata = function() {
        return NcwmsService.ncWMSdata;
      };

      this.selectedStyles = [];
      Messagebus.subscribe('ncwmsStyleSelected', function(event, value) {
        if (value.layerId === $scope.layerId && this.selectedStyles[$scope.layerId] !== value.style) {
          this.selectedStyles[$scope.layerId] = value.style;
        }
      }.bind(this));

      this.selectStyle = function(style) {
        Messagebus.publish('ncwmsStyleSelected', {'layerId':$scope.layerId, 'style':style} );
      };
    }

  angular.module('eWaterCycleApp.style').controller('StyleController', StyleController);
})();
