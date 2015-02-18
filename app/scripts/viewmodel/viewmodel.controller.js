(function() {
  'use strict';

    function ViewmodelController(cesiumViewerService) {        
        var me = this;
        this.viewmodel = "Globe View";

        this.data = {
            "viewmodels" : [ 'Globe View', 'Columbus View', 'Map View' ]
        };

        this.selectViewmodel = function(item) {
            this.viewmodel = item;
            if (item == 'Globe View') {
                cesiumViewerService.viewer.scene.morphTo3D(2.0);
            } else if (item == 'Columbus View') {
                cesiumViewerService.viewer.scene.morphToColumbusView(2.0);
            } else if (item == 'Map View') {
                cesiumViewerService.viewer.scene.morphTo2D(2.0);
            }
        }
    }

  angular.module('eWaterCycleApp.viewmodel').controller('ViewmodelController', ViewmodelController);
})();
