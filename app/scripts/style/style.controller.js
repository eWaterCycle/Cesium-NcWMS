(function() {
  'use strict';

    function StyleController(NcwmsService, Messagebus) {
        this.getNcWMSdata = function() {
            return NcwmsService.ncWMSdata;
        };

        this.selectedStyle = 'default';
        Messagebus.subscribe('ncwmsStyleSelected', function(event, value) {
            if (this.selectedStyle !== value) {
                this.selectedStyle = value;
            }
        }.bind(this));

        this.selectStyle = function(style) {
            Messagebus.publish('ncwmsStyleSelected', style);
        };
    }

  angular.module('eWaterCycleApp.style').controller('StyleController', StyleController);
})();
