(function() {
  'use strict';

  function CesiumViewerController(Cesium, CesiumViewerService, Messagebus) {
    this.init = function(element){
      CesiumViewerService.init(element);
    };    
      
    //this.startTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
    //this.stopTime = new Date(Date.UTC(2020, 0, 31, 0, 0, 0));
    Messagebus.subscribe('timeFrameRedefined', function(event, value) {
        var startTime = value.start;
        var stopTime = value.stop;
        
        CesiumViewerService.timelineWidget.zoomTo(Cesium.JulianDate.fromDate(startTime), Cesium.JulianDate.fromDate(stopTime));
    });   
      
    this.selectedTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
    Messagebus.subscribe('ncwmsTimeSelected', function(event, value) {
        this.selectedTime = value;
    }.bind(this));
    
  }

  angular.module('eWaterCycleApp.cesiumViewer').controller('CesiumViewerController', CesiumViewerController);
})();
