(function() {
  'use strict';

    function StyleController($scope, NcwmsService, Messagebus) {
        this.getNcWMSdata = function() {
            return NcwmsService.ncWMSdata;
        };

        this.selectedStyle = 'default';
        Messagebus.subscribe('ncwmsStyleSelected', function(event, value) {
            if (this.selectedStyle !== value.style) {
                this.selectedStyle = value.style;
            }
        }.bind(this));

        this.selectStyle = function(style) {
            Messagebus.publish('ncwmsStyleSelected', {'layerId':$scope.layerId, 'style':style} );
        };
    }

  angular.module('eWaterCycleApp.style').controller('StyleController', StyleController);
})();
