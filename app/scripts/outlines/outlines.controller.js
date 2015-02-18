(function() {
  'use strict';

    function OutlinesController(cesiumViewerService) {        
        this.outlines = false;        
    }

  angular.module('eWaterCycleApp.outlines').controller('OutlinesController', OutlinesController);
})();
