(function() {
  'use strict';

  function CesiumViewerController(cesiumViewerService) {
    this.init = function(el){
      cesiumViewerService.init(el);
    };
  }

  angular.module('eWaterCycleApp.cesiumViewer').controller('CesiumViewerController', CesiumViewerController);
})();
