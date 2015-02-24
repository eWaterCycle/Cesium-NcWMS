(function() {
  'use strict';

    function ViewmodelController(CesiumViewerService) {        
        this.viewmodel = 'Globe View';

        this.data = {
            'viewmodels' : [ 'Globe View', 'Columbus View', 'Map View' ]
        };

        this.selectViewmodel = function(item) {
            this.viewmodel = item;
            if (item === 'Globe View') {
                CesiumViewerService.viewer.scene.morphTo3D(2.0);
            } else if (item === 'Columbus View') {
                CesiumViewerService.viewer.scene.morphToColumbusView(2.0);
            } else if (item === 'Map View') {
                CesiumViewerService.viewer.scene.morphTo2D(2.0);
            }
        };
    }

  angular.module('eWaterCycleApp.viewmodel').controller('ViewmodelController', ViewmodelController);
})();
