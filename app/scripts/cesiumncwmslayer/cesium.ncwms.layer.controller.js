(function() {
  'use strict';

  function CesiumNcwmsLayerController($q, $http, Cesium, CesiumViewerService, NcwmsService, Messagebus) {
    this.selectedTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
    Messagebus.subscribe('ncwmsTimeSelected', function(event, value) {
      if (this.selectedTime !== value) {
        this.selectedTime = value;
        this.repaintColorMap(0);
      }
    }.bind(this));

    this.layers = [{
      dataset : 'default',
      logarithmic : false,
      palette : 'default',
      style : 'default',
      min : 0,
      max : 100
    },{
      dataset : 'default',
      logarithmic : false,
      palette : 'default',
      style : 'default',
      min : 0,
      max : 100
    }];

    Messagebus.subscribe('logarithmicChange', function(event, value) {
      if (this.logarithmic !== value.logartihmic) {
        this.layers[value.layerId].logarithmic = value.logartihmic;

        if (value) {
          this.layers[value.layerId].min = 1;
        } else {
          this.layers[value.layerId].min = this.layers[value.layerId].dataset.min;
        }
        Messagebus.publish('legendMinChange', {'layerId':value.layerId, 'min':this.layers[value.layerId].min});
        this.repaintColorMap(0);
      }
    }.bind(this));

    this.terrain = true;
    Messagebus.subscribe('terrainChange', function(event, value) {
      if (this.terrain !== value) {
        this.terrain = value;
        this.repaintColorMap(0);
      }
    }.bind(this));

    Messagebus.subscribe('ncwmsDatasetSelected', function(event, value) {
      if (this.layers[value.layerId].dataset !== value.dataset) {
        this.layers[value.layerId].dataset = value.dataset;
        this.repaintColorMap(0);
      }
    }.bind(this));

    Messagebus.subscribe('ncwmsStyleSelected', function(event, value) {
      if (this.layers[value.layerId].style !== value.style) {
        this.layers[value.layerId].style = value.style;
        this.repaintColorMap(0);
      }
    }.bind(this));

    Messagebus.subscribe('ncwmsPaletteSelected', function(event, value) {
      if (this.layers[value.layerId].palette !== value.palette) {
        this.layers[value.layerId].palette = value.palette;
        this.repaintColorMap(0);
      }
    }.bind(this));

    Messagebus.subscribe('legendMinChange', function(event, value) {
      if (this.layers[value.layerId].min !== value.min) {
        this.layers[value.layerId].min = value.min;
        this.repaintColorMap(0);
      }
    }.bind(this));

    Messagebus.subscribe('legendMaxChange', function(event, value) {
      if (this.layers[value.layerId].max !== value.max) {
        this.layers[value.layerId].max = value.max;
        this.repaintColorMap(0);
      }
    }.bind(this));

    NcwmsService.ready.then(function() {
      this.repaintColorMap(0);

      var julianDate = Cesium.JulianDate.fromIso8601(NcwmsService.startDate.toISOString());
      CesiumViewerService.clock.currentTime = julianDate;
    }.bind(this));

    //Translate Cesium selected times to something ncwms can understand (closest available time) and propagate via Messagebus.
    Messagebus.subscribe('cesiumTimeSelected', function(event, value) {
      if (NcwmsService.initialized && NcwmsService.datasets.length > 0) {
        var closest = NcwmsService.datasets[NcwmsService.datasets.indexOf(this.layers[0].dataset)].datesWithData[0];

        NcwmsService.datasets[NcwmsService.datasets.indexOf(this.layers[0].dataset)].datesWithData.forEach(function(date) {
          if (date < value) {
            closest = date;
          }
        });

        Messagebus.publish('ncwmsTimeSelected', closest);
      }
    }.bind(this));

    var colorMapLayers = [];

    this.repaintColorMap = function(layerId) {
      if (!NcwmsService.initialized) {
        return;
      }

      var oldColorMapLayer;
      if (colorMapLayers[layerId] !== null) {
        oldColorMapLayer = colorMapLayers[layerId];
      };

      var datasetForMap = this.layers[layerId].dataset;
      if (this.layers[layerId].dataset.statsGroup) {
        datasetForMap = this.layers[layerId].dataset.datasetMean;
      }

      var parameters = {
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        CRS: 'CRS:84',
        styles: this.layers[layerId].style + '/' + this.layers[layerId].palette.name,
        format: 'image/png',
        LOGSCALE: this.layers[layerId].logarithmic
      };

      if (datasetForMap.metaData) {
        if (datasetForMap.metaData.supportsTimeseries) {
          parameters.TIME = this.selectedTime.toISOString();
        }

        if (this.terrain) {
          parameters.TRANSPARENT = 'true';
          parameters.COLORSCALERANGE = ('' + this.layers[layerId].min + ',' + this.layers[layerId].max);
          parameters.ABOVEMAXCOLOR = 'extend';
          parameters.BELOWMINCOLOR = 'extend';

          colorMapLayers[layerId] = CesiumViewerService.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
            url: NcwmsService.ncWMSURL,
            layers: datasetForMap.id,
            parameters: parameters,
            enablePickFeatures: false
          }));

          colorMapLayers[layerId].alpha = 0.3;
          colorMapLayers[layerId].brightness = 2.0;
        } else {
          parameters.TRANSPARENT = 'false';
          parameters.COLORSCALERANGE = ('' + this.layers[layerId].min + ',' + this.layers[layerId].max);
          parameters.BGCOLOR = '0x000011';
          parameters.ABOVEMAXCOLOR = 'extend';
          parameters.BELOWMINCOLOR = '0x000000';

          colorMapLayers[layerId] = CesiumViewerService.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
            url: NcwmsService.ncWMSURL,
            layers: datasetForMap.id,
            parameters: parameters,
            enablePickFeatures: false
          }));

          colorMapLayers[layerId].alpha = 1.0;
          colorMapLayers[layerId].brightness = 2.0;
        }

        // viewer.scene.imageryLayers.addImageryProvider(provider);

        if (oldColorMapLayer !== null) {
          CesiumViewerService.viewer.scene.imageryLayers.remove(oldColorMapLayer, true);
        }
      }
    }.bind(this);
  }

  angular.module('eWaterCycleApp.cesiumNcwmsLayer').controller('CesiumNcwmsLayerController', CesiumNcwmsLayerController);
})();
