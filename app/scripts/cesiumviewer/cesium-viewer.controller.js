(function() {
  'use strict';

  function CesiumViewerController($scope, $http, Cesium, CesiumViewerService, Messagebus) {
    this.lastClicked = {
      'latitude': '',
      'longitude': '',
      'meanValue': '',
      'errorValue': ''
    };

    this.marker = {};

    this.init = function(element) {
      CesiumViewerService.init(element);
      CesiumViewerService.timelineWidget.addEventListener('settime', this.onTimelineScrub, false);
      CesiumViewerService.clock.onTick.addEventListener(this.onTimelineTick);

      this.addPicking();
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
        destination: Cesium.Cartesian3.fromDegrees(value.country.latlng[1], value.country.latlng[0], value.height ? 10000000 : Math.max(value.country.area / Math.PI, 1000000))
      });
    });

    Messagebus.subscribe('cesiumCoordinatesClicked', function(event, value) {
      var ellipsoid = CesiumViewerService.viewer.scene.globe.ellipsoid;
      var cartesian = ellipsoid.cartographicToCartesian(new Cesium.Cartographic(value.longitude, value.latitude, 0));

      CesiumViewerService.viewer.entities.remove(this.marker);
      this.marker = CesiumViewerService.viewer.entities.add({
        position: cartesian,
        billboard : {
            image : 'images/magnifying-glass.png',
            width : 64,
            height : 64
        }
      });

    }.bind(this));

    //Add eventlisteners for the timeline
    this.onTimelineScrub = function(e) {
      CesiumViewerService.clock.currentTime = e.timeJulian;
      CesiumViewerService.clock.shouldAnimate = false;

      var selection = Cesium.JulianDate.toDate(CesiumViewerService.clock.currentTime);

      Messagebus.publish('cesiumTimeSelected', selection);
    };

    this.onTimelineTick = function() {
      var selection = Cesium.JulianDate.toDate(CesiumViewerService.clock.currentTime);

      Messagebus.publish('cesiumTimeSelected', selection);
    };

    Messagebus.subscribe('d3TimeSelected', function(event, value) {
      var julianDate = Cesium.JulianDate.fromIso8601(value.toISOString());
      CesiumViewerService.clock.currentTime = julianDate;
      CesiumViewerService.clock.shouldAnimate = false;

      var selection = Cesium.JulianDate.toDate(CesiumViewerService.clock.currentTime);

      Messagebus.publish('cesiumTimeSelected', selection);
    });

    this.addPicking = function() {
      var ellipsoid = CesiumViewerService.viewer.scene.globe.ellipsoid;
      //var labels = new Cesium.LabelCollection();
      //labels.add();
      //CesiumViewerService.viewer.scene.primitives.add(labels);

      // Mouse over the globe to see the cartographic position
      CesiumViewerService.viewer.handler = new Cesium.ScreenSpaceEventHandler(CesiumViewerService.viewer.scene.canvas);

      CesiumViewerService.viewer.handler.setInputAction(function(doubleclick) {
        var cartesian = CesiumViewerService.viewer.scene.camera.pickEllipsoid(doubleclick.position, ellipsoid);
        if (cartesian) {
          var cartographic = ellipsoid.cartesianToCartographic(cartesian);
          CesiumViewerService.viewer.scene.camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude),
              CesiumViewerService.viewer.scene.camera.positionCartographic.height)
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      CesiumViewerService.viewer.handler.setInputAction(function(singleclick) {
        var cartesian = CesiumViewerService.viewer.scene.camera.pickEllipsoid(singleclick.position, ellipsoid);
        if (cartesian) {
          var cartographic = ellipsoid.cartesianToCartographic(cartesian);
          var leftTopLon = Cesium.Math.toDegrees(cartographic.longitude) - 1;
          var leftTopLat = Cesium.Math.toDegrees(cartographic.latitude) - 1;
          var rightBottomLon = Cesium.Math.toDegrees(cartographic.longitude) + 1;
          var rightBottomLat = Cesium.Math.toDegrees(cartographic.latitude) + 1;

          CesiumViewerService.viewer.entities.remove(this.marker);
          this.marker = CesiumViewerService.viewer.entities.add({
            position: cartesian,
            billboard : {
                image : 'images/magnifying-glass.png',
                width : 64,
                height : 64
            }
          });

          //console.log(Cesium.SceneTransforms.wgs84ToWindowCoordinates(CesiumViewerService.viewer.scene, cartesian));

          Messagebus.publish('cesiumCoordinatesClicked', {
            'latitude': cartographic.latitude,
            'longitude': cartographic.longitude,
            'leftTopLat': leftTopLat,
            'leftTopLon': leftTopLon,
            'rightBottomLat': rightBottomLat,
            'rightBottomLon': rightBottomLon
          });
        }
      }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }.bind(this);
  }

  angular.module('eWaterCycleApp.cesiumViewer').controller('CesiumViewerController', CesiumViewerController);
})();
