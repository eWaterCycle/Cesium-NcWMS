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

    Messagebus.subscribe('ncwmsLoadingComplete', function(event, value) {
      if (value === true) {
        this.repaintColorMap();
      }
    }.bind(this));

    //Translate Cesium selected times to something ncwms can understand (closest available time) and propagate via Messagebus.
    Messagebus.subscribe('cesiumTimeSelected', function(event, value) {
      if (NcwmsService.initialized && NcwmsService.datasets.length > 0) {
        var closest = NcwmsService.datasets[NcwmsService.datasets.indexOf(this.selectedDataset)].datesWithData[0];

        if (NcwmsService.initialized === true) {
          NcwmsService.datasets[NcwmsService.datasets.indexOf(this.selectedDataset)].datesWithData.forEach(function(date) {
            if (date < value) {
              closest = date;
            }
          });

          Messagebus.publish('ncwmsTimeSelected', closest);
        }
      }
    }.bind(this));

    this.getSupportedTimesInISOFormat = function() {
      var times = [];
      NcwmsService.datasets[NcwmsService.datasets.indexOf(this.selectedDataset)].datesWithData.forEach(function(date) {
        times.push(date.toISOString());
      });

      return times;
    };

    Messagebus.subscribe('cesiumCoordinatesClicked', function(event, value) {
      if (!NcwmsService.initialized || NcwmsService.datasets.length === 0) {
        return;
      }

      var lat = value.latitude;
      var lon = value.longitude;
      var ltlo = value.leftTopLon;
      var ltla = value.leftTopLat;
      var rblo = value.rightBottomLon;
      var rbla = value.rightBottomLat;

      // Define an array to store our waiting promises in
      var httpRequestPromises = [];

      var times = this.getSupportedTimesInISOFormat();

      times.forEach(function(time) {
        var promise = $http.get(NcwmsService.ncWMSURL +
          'SERVICE=WMS' +
          '&VERSION=1.3.0' +
          '&REQUEST=GetFeatureInfo' +
          '&LAYERS=' + this.selectedDataset.id +
          '&QUERY_LAYERS=' + this.selectedDataset.id +
          '&STYLES=' + this.selectedDataset.metaData.supportedStyles[0] +
          '/' + this.selectedPalette.name +
          '&BBOX=' + ltlo.toFixed(6) + ',' + ltla.toFixed(6) + ',' + rblo.toFixed(6) + ',' + rbla.toFixed(6) +
          '&FEATURE_COUNT=5' +
          '&HEIGHT=100' +
          '&WIDTH=100' +
          '&FORMAT=image/png' +
          '&INFO_FORMAT=text/xml' +
          '&CRS=CRS:84' +
          '&I=50' +
          '&J=50' +
          '&TIME=' + time);
        httpRequestPromises.push(promise);
      }.bind(this));

      var parseXml;

      if (typeof window.DOMParser !== 'undefined') {
        parseXml = function(xmlStr) {
          return (new window.DOMParser()).parseFromString(xmlStr, 'text/xml');
        };
      } else if (typeof window.ActiveXObject !== 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
        parseXml = function(xmlStr) {
          var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
          xmlDoc.async = 'false';
          xmlDoc.loadXML(xmlStr);
          return xmlDoc;
        };
      } else {
        throw new Error('No XML parser found');
      }

      $q.all(httpRequestPromises).then(function(res) {
        var graphInfo = [];

        res.forEach(function(individualResolve) {
          var xml = parseXml(individualResolve.data);

          var timeHTML = xml.getElementsByTagName('time')[0];
          var time;
          if (timeHTML !== undefined) {
            time = timeHTML.innerHTML;
          }
          var valueHTML = xml.getElementsByTagName('value')[0];
          var value;
          if (valueHTML !== undefined) {
            value =  valueHTML.innerHTML;
          }
          var errorHTML = xml.getElementsByTagName('value')[1];
          var error;
          if (errorHTML !== undefined) {
            error = errorHTML.innerHTML;
          } else {
            error = 0;
          }

          var resLatHTML = xml.getElementsByTagName('latitude')[0];
          var resLat;
          if (resLatHTML !== undefined) {
            resLat = resLatHTML.innerHTML;
          }
          var resLonHTML = xml.getElementsByTagName('longitude')[0];
          var resLon;
          if (resLonHTML !== undefined) {
            resLon = resLonHTML.innerHTML;
          }

          if (time !== undefined && value !== undefined && error !== undefined && resLat !== undefined && resLon !== undefined) {
            graphInfo.push({
              'time' : time.replace('+01:00', '+0100'),
              'latitude' : resLat,
              'longitude' : resLon,
              'value' : parseFloat(value),
              'error' : parseFloat(error)
            });
          }
        });
        if (graphInfo.length > 0) {
          Messagebus.publish('graphUpdateEvent', graphInfo);
        }

      });
    }.bind(this));

    var colorMapLayer;

    this.repaintColorMap = function() {
      if (!NcwmsService.initialized) {
        return;
      }

      var oldColorMapLayer;
      if (colorMapLayer !== null) {
        oldColorMapLayer = colorMapLayer;
      }

      var parameters = {
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        CRS: 'CRS:84',
        styles: this.selectedDataset.metaData.supportedStyles[0] + '/' + this.selectedPalette.name,
        format: 'image/png',
        LOGSCALE: this.logarithmic
      };

      if (this.selectedDataset.metaData) {
        if (this.selectedDataset.metaData.supportsTimeseries) {
          parameters.TIME = this.selectedTime.toISOString();
        }

        if (this.terrain) {
          parameters.TRANSPARENT = 'true';
          parameters.COLORSCALERANGE = this.logarithmic ? (1 + ',' + this.legendMax) : (this.legendMin + ',' + this.legendMax);
          parameters.ABOVEMAXCOLOR = 'extend';
          parameters.BELOWMINCOLOR = 'extend';

          colorMapLayer = CesiumViewerService.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
            url: NcwmsService.ncWMSURL,
            layers: this.selectedDataset.id,
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
            layers: this.selectedDataset.id,
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
    };
  }

  angular.module('eWaterCycleApp.cesiumNcwmsLayer').controller('CesiumNcwmsLayerController', CesiumNcwmsLayerController);
})();
