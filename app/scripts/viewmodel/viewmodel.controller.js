(function() {
  'use strict';

    function ViewmodelController(Messagebus) {        
        this.viewmodel = 'Globe View';

        this.data = {
            'viewmodels' : [ 'Globe View', 'Columbus View', 'Map View' ]
        };
        
        this.selectViewmodel = function(item) {
            this.viewmodel = item;
            Messagebus.publish('cesiumViewmodelSelected', item);
        };
    }

  angular.module('eWaterCycleApp.viewmodel').controller('ViewmodelController', ViewmodelController);
})();
