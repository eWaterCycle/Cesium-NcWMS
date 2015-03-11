(function() {
  'use strict';

  function CesiumViewerController(Cesium, CesiumViewerService, Messagebus) {
    this.init = function(element){
        CesiumViewerService.init(element);
        CesiumViewerService.timelineWidget.addEventListener('settime', this.onTimelineScrub, false);
        CesiumViewerService.clock.onTick.addEventListener(this.onTimelineTick);
    };

    //this.startTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
    //this.stopTime = new Date(Date.UTC(2020, 0, 31, 0, 0, 0));
    Messagebus.subscribe('timeFrameRedefined', function(event, value) {
        var startTime = value.start;
        var stopTime = value.stop;

        CesiumViewerService.timelineWidget.zoomTo(Cesium.JulianDate.fromDate(startTime), Cesium.JulianDate.fromDate(stopTime));
    });

    //Subscribe to ncwms time to change the clock.
    this.selectedTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
    Messagebus.subscribe('ncwmsTimeSelected', function(event, value) {
        this.selectedTime = value;
    }.bind(this));

    Messagebus.subscribe('cesiumViewmodelSelected', function(event, value) {
        if (value === 'Globe View') {
            CesiumViewerService.viewer.scene.morphTo3D(2.0);
        } else if (value === 'Columbus View') {
            CesiumViewerService.viewer.scene.morphToColumbusView(2.0);
        } else if (value === 'Map View') {
            CesiumViewerService.viewer.scene.morphTo2D(2.0);
        }
    });

    Messagebus.subscribe('cesiumFlyToCountry', function(event, value) {
        CesiumViewerService.viewer.scene.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(value.country.latlng[1], value.country.latlng[0], value.height ? 10000000 : Math.max(value.country.area / Math.PI, 1000000))
        });
    });

    //Add eventlisteners for the timeline
    this.onTimelineScrub = function(e) {
        CesiumViewerService.clock.currentTime = e.timeJulian;
        CesiumViewerService.clock.shouldAnimate = false;

        var selection = Cesium.JulianDate.toDate(CesiumViewerService.clock.currentTime);

        Messagebus.publish('cesiumTimeSelected', selection);
    };

    this.onTimelineTick = function(clock) {
        var selection = Cesium.JulianDate.toDate(CesiumViewerService.clock.currentTime);

        Messagebus.publish('cesiumTimeSelected', selection);
    };
  }

  angular.module('eWaterCycleApp.cesiumViewer').controller('CesiumViewerController', CesiumViewerController);
})();
