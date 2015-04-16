(function() {
  'use strict';

  function CesiumNcwmsLayerController($q, $http, Cesium, CesiumViewerService, NcwmsService, Messagebus) {
    this.selectedTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
    Messagebus.subscribe('ncwmsTimeSelected', function(event, value) {
      if (this.selectedTime !== value) {
        this.selectedTime = value;
        this.repaintColorMap();
      }
    }.bind(this));

    this.logarithmic = false;
    Messagebus.subscribe('logarithmicChange', function(event, value) {
      if (this.logarithmic !== value) {
        this.logarithmic = value;

        if (value) {
          this.legendMin = 1;
        } else {
          this.legendMin = this.selectedDataset.min;
        }
        Messagebus.publish('legendMinChange', this.legendMin);
        this.repaintColorMap();
      }
    }.bind(this));

    this.terrain = true;
    Messagebus.subscribe('terrainChange', function(event, value) {
      if (this.terrain !== value) {
        this.terrain = value;
        this.repaintColorMap();
      }
    }.bind(this));

    this.selectedDataset = 'default';
    Messagebus.subscribe('ncwmsDatasetSelected', function(event, value) {
      if (this.selectedDataset !== value) {
        this.selectedDataset = value;
        this.repaintColorMap();
      }
    }.bind(this));

    this.selectedStyle = 'default';
    Messagebus.subscribe('ncwmsStyleSelected', function(event, value) {
      if (this.selectedStyle !== value) {
        this.selectedStyle = value;
        this.repaintColorMap();
      }
    }.bind(this));

    this.selectedPalette = 'default';
    Messagebus.subscribe('ncwmsPaletteSelected', function(event, value) {
      if (this.selectedPalette !== value) {
        this.selectedPalette = value;
        this.repaintColorMap();
      }
    }.bind(this));

    this.legendMin = 0;
    Messagebus.subscribe('legendMinChange', function(event, value) {
      if (this.legendMin !== value) {
        this.legendMin = value;
        this.repaintColorMap();
      }
    }.bind(this));

    this.legendMax = 50;
    Messagebus.subscribe('legendMaxChange', function(event, value) {
      if (this.legendMax !== value) {
        this.legendMax = value;
        this.repaintColorMap();
      }
    }.bind(this));

    NcwmsService.ready.then(function() {
      this.repaintColorMap();

      var julianDate = Cesium.JulianDate.fromIso8601(NcwmsService.startDate.toISOString());
      CesiumViewerService.clock.currentTime = julianDate;
    }.bind(this));

    //Translate Cesium selected times to something ncwms can understand (closest available time) and propagate via Messagebus.
    Messagebus.subscribe('cesiumTimeSelected', function(event, value) {
      if (NcwmsService.initialized && NcwmsService.datasets.length > 0) {
        var closest = NcwmsService.datasets[NcwmsService.datasets.indexOf(this.selectedDataset)].datesWithData[0];

        NcwmsService.datasets[NcwmsService.datasets.indexOf(this.selectedDataset)].datesWithData.forEach(function(date) {
          if (date < value) {
            closest = date;
          }
        });

        Messagebus.publish('ncwmsTimeSelected', closest);
      }
    }.bind(this));

    var colorMapLayer, overlayMapLayer;

    this.repaintColorMap = function() {
      if (!NcwmsService.initialized) {
        return;
      }

      var oldColorMapLayer, oldOverlayMapLayer;
      if (colorMapLayer !== null) {
        oldColorMapLayer = colorMapLayer;
      };
      if (overlayMapLayer !== null) {
        oldOverlayMapLayer = overlayMapLayer;
      }

      var datasetForMap = this.selectedDataset;
      if (this.selectedDataset.statsGroup) {
        datasetForMap = this.selectedDataset.datasetMean;
      }

      var parameters = {
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        CRS: 'CRS:84',
        styles: this.selectedStyle + '/' + this.selectedPalette.name,
        format: 'image/png',
        LOGSCALE: this.logarithmic
      };

      if (datasetForMap.metaData) {
        if (datasetForMap.metaData.supportsTimeseries) {
          parameters.TIME = this.selectedTime.toISOString();
        }

        if (this.terrain) {
          parameters.TRANSPARENT = 'true';
          parameters.COLORSCALERANGE = this.logarithmic ? (1 + ',' + this.legendMax) : (this.legendMin + ',' + this.legendMax);
          parameters.ABOVEMAXCOLOR = 'extend';
          parameters.BELOWMINCOLOR = 'extend';

          colorMapLayer = CesiumViewerService.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
            url: NcwmsService.ncWMSURL,
            layers: datasetForMap.id,
            parameters: parameters,
            enablePickFeatures: false
          }));

          colorMapLayer.alpha = 0.3;
          colorMapLayer.brightness = 2.0;
        } else {
          parameters.TRANSPARENT = 'false';
          parameters.COLORSCALERANGE = this.logarithmic ? (1 + ',' + this.legendMax) : (this.legendMin + ',' + this.legendMax);
          parameters.BGCOLOR = '0x000011';
          parameters.ABOVEMAXCOLOR = 'extend';
          parameters.BELOWMINCOLOR = '0x000000';

          colorMapLayer = CesiumViewerService.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
            url: NcwmsService.ncWMSURL,
            layers: datasetForMap.id,
            parameters: parameters,
            enablePickFeatures: false
          }));

          colorMapLayer.alpha = 1.0;
          colorMapLayer.brightness = 2.0;
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
