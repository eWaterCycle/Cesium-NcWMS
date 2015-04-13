(function() {
  'use strict';

  function NcwmsService($q, $http, Messagebus) {
    this.ncWMSURL = 'http://localhost:8080/ncWMS-2.0-rc1-maartenvm/wms?';

    var deferred = $q.defer();
    this.ready = deferred.promise;

    this.ncWMSdata = {
      'metadata': {},
      'palettes': []
    };
    this.datasets = [];
    this.startDate = {};
    this.endDate = {};

    this.initialized = false;

    this.init = function() {
      // load JSON data
      $http.get('serverconfig.json').then(function(res) {
        if (res.data.id === 'ncWMS') {
          this.ncWMSURL = res.data.url;
        } else {
          console.log(res.data.url + ' is no valid server config, defaulting to: ' + this.ncWMSURL);
        }

        // Ask the server to give us the data we need to get started, in
        // this case an overview of the available datasets
        this.getMenu().then(function success(menuPromise) {
          // Build an array containing our datasets (--NG--)
          this.datasets = this.loadMenu(menuPromise);
          // Store the first dataset as our 'currently selected' dataset
          // (--NG--)
          Messagebus.publish('ncwmsDatasetSelected', this.datasets[0]);

          // Get the id of the first dataset we got from the server,
          // because we can
          // only get some information out of the server if we dig a
          // little deeper, and we need an ID to do just that.
          var firstDatasetID = menuPromise.data.children[0].children[0].id;

          // To get the server to give us the available palette names,
          // we use this first ID
          this.getMetadata(firstDatasetID).then(function success(firstDatasetMetaDataPromise) {
            // Store the palette names and image URL's. (--NG--)
            this.ncWMSdata.palettes = this.loadPalettes(firstDatasetID, firstDatasetMetaDataPromise.data.palettes);

            // Store the first palette we receive as the currently
            // selected palette. (--NG--)
            //me.selectedPalette = this.ncWMSdata.palettes[0];
            Messagebus.publish('ncwmsPaletteSelected', this.ncWMSdata.palettes[0]);
          }.bind(this), function error(msg) {
            console.log('Error in getMetadata, ' + msg);
          });

          // Define an array to store our waiting promises in
          var httpRequestPromises = [];

          // Do a new metadata request for every loaded dataset
          this.datasets.forEach(function(dataset) {
            var promise = this.getMetadata(dataset.id).then(function success(metaDataPromise) {
              var workingDataset = this.datasets[this.datasets.indexOf(dataset)];
              workingDataset.metaData = metaDataPromise.data;

              // Once the metadata request is resolved, store the
              // dates with
              // data in
              // the previously made datasets datastructure.
              var dates = [];
              if (metaDataPromise.data.supportsTimeseries) {
                for (var year in metaDataPromise.data.datesWithData) {
                  var monthArray = metaDataPromise.data.datesWithData[year];
                  for (var month in monthArray) {
                    var dayArray = monthArray[month];
                    for (var day in dayArray) {
                      dates.push(new Date(Date.UTC(year, month, dayArray[day], 0, 0, 0)));
                    }
                  }
                }
              }
              workingDataset.datesWithData = dates;

              // Store the scale ranges
              workingDataset.min = parseFloat(metaDataPromise.data.scaleRange[0]);
              workingDataset.max = parseFloat(metaDataPromise.data.scaleRange[1]);

              workingDataset.units = metaDataPromise.data.units;
            }.bind(this), function error(msg) {
              console.log('Error in getMetadata, ' + msg);
            });
            // Add this promise to the array of waiting promises.
            httpRequestPromises.push(promise);
          }.bind(this));

          // The $q service lets us wait for an array of promises to be
          // resolved
          // before continuing. We wait here until all the promises for
          // the metadata requests for each dataset are complete.
          $q.all(httpRequestPromises).then(function() {
            var dates = this.datasets[this.datasets.indexOf(this.datasets[0])].datesWithData;

            this.datasets.forEach(function(dataset) {
              var workingDataset = this.datasets[this.datasets.indexOf(dataset)];
              if (workingDataset.statsGroup) {
                //If this dataset is a statistics group, modify it's min and max to reflect the actual value represented.

                var id = workingDataset.id.split('/')[0];
                var ds1 = id + '/' + workingDataset.id.split('/')[1].split(':')[0];
                var ds2 = id + '/' + workingDataset.id.split('/')[1].split(':')[1].split('-')[0];

                workingDataset.graphicalMin = this.getDatasetByName(ds1).min;
                workingDataset.graphicalMax = this.getDatasetByName(ds1).max + this.getDatasetByName(ds2).max;

                //Link the error and mean datasets to it
                workingDataset.datasetMean = this.getDatasetByName(ds1);
                workingDataset.datasetError = this.getDatasetByName(ds2);
              }
            }.bind(this));

            this.startDate = dates[0];
            this.endDate = dates[this.datasets[this.datasets.indexOf(this.datasets[0])].datesWithData.length - 1];

            Messagebus.publish('timeFrameRedefined', {
              start: this.startDate,
              stop: this.endDate
            });

            var datasetForMap = this.datasets[0];
            if (this.datasets[0].statsGroup) {
              datasetForMap = this.datasets[0].datasetMean;
            }

            Messagebus.publish('ncwmsUnitsChange', datasetForMap.units);
            Messagebus.publish('legendMinChange', datasetForMap.min);
            Messagebus.publish('legendMaxChange', datasetForMap.max);

            // if (this.datasets[0].graphicalMin !== 0) {
            //   Messagebus.publish('graphMinChange', this.datasets[0].graphicalMin);
            //   Messagebus.publish('graphMaxChange', this.datasets[0].graphicalMax);
            // } else {
            //   Messagebus.publish('graphMinChange', this.datasets[0].min);
            //   Messagebus.publish('graphMaxChange', this.datasets[0].max);
            // }

            deferred.resolve();
            this.initialized = true;
          }.bind(this));

        }.bind(this), function error(msg) {
          console.log('Error in getMenu, ' + msg);
        });
      }.bind(this));
    };

    this.getMenu = function() {
      return $http.get(this.ncWMSURL + 'item=menu&menu=&REQUEST=GetMetadata');
    };

    this.loadMenu = function(menuPromiseResolve) {
      var result = [];

      this.ncWMSdata.metadata = menuPromiseResolve.data.children;
      menuPromiseResolve.data.children.forEach(function(dataset) {
        var dataSetLabel = dataset.label;
        dataset.children.forEach(function(child) {
          if (child.plottable) {
            //Check if this is a ncwms stats_group
            if (child.id.indexOf('stats_group') > -1) {
              //This is a stats group, so we will infer the min and max from the first child
              result.push({
                id: child.id,
                label: dataSetLabel + '/' + child.label,
                statsGroup: true,
                datesWithData: {},
                min: 0.0,
                max: 0.0,
                units: {},
                graphicalMin: 0,
                graphicalMax: 0
              });
            } else {
              //Not a stats_group, but a normal dataset
              result.push({
                id: child.id,
                label: dataSetLabel + '/' + child.label,
                statsGroup: false,
                datesWithData: {},
                min: 0.0,
                max: 0.0,
                units: {},
                graphicalMin: 0,
                graphicalMax: 0
              });
            }
            if (child.children !== undefined) {
              child.children.forEach(function(grandChild) {
                if (grandChild.plottable) {
                  //The children of stats_groups are treated as normal datasets
                  result.push({
                    id: grandChild.id,
                    label: dataSetLabel + '/' + grandChild.label,
                    statsGroup: false,
                    datesWithData: {},
                    min: 0.0,
                    max: 0.0,
                    units: {},
                    graphicalMin: 0,
                    graphicalMax: 0
                  });
                }
              });
            }
          }
        });
      });

      return result;
    };

    this.getMetadata = function(id) {
      return $http.get(this.ncWMSURL + 'item=layerDetails&layerName=' + id + '&REQUEST=GetMetadata');
    };

    this.loadPalettes = function(id, res) {
      var result = [];

      res.forEach(function(paletteName) {
        var imgURL2 = this.ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + id + '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + paletteName;

        result.push({
          name: paletteName,
          graphic: imgURL2
        });
      }.bind(this));

      return result;
    };

    this.getSupportedTimesInISOFormat = function(selectedDataset) {
      var times = [];
      this.datasets[this.datasets.indexOf(selectedDataset)].datesWithData.forEach(function(date) {
        times.push(date.toISOString());
      });

      return times;
    };

    this.getFeatureInfoSeries = function(selectedDataset, selectedPalette, boundingRect, callbackSuccess, callbackFailure) {
      if (this.datasets.length === 0) {
        return;
      }

      var ltlo = boundingRect.leftTopLon;
      var ltla = boundingRect.leftTopLat;
      var rblo = boundingRect.rightBottomLon;
      var rbla = boundingRect.rightBottomLat;

      // Define an array to store our waiting promises in
      var httpRequestPromises = [];

      var times = this.getSupportedTimesInISOFormat(selectedDataset);

      times.forEach(function(time) {
        var promise = $http.get(this.ncWMSURL +
          'SERVICE=WMS' +
          '&VERSION=1.3.0' +
          '&REQUEST=GetFeatureInfo' +
          '&LAYERS=' + selectedDataset.id +
          '&QUERY_LAYERS=' + selectedDataset.id +
          '&STYLES=' + selectedDataset.metaData.supportedStyles[0] +
          '/' + selectedPalette.name +
          '&BBOX=' + ltlo.toFixed(6) + ',' + ltla.toFixed(6) + ',' + rblo.toFixed(6) + ',' + rbla.toFixed(6) +
          '&FEATURE_COUNT=2' +
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
            value = valueHTML.innerHTML;
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
              'time': time.replace(new RegExp(/\+([0-9]{2}):([0-9]{2})/), '+$1$2'),
              'latitude': resLat,
              'longitude': resLon,
              'value': parseFloat(value),
              'error': parseFloat(error)
            });
          }

        });

        if (graphInfo !== undefined && graphInfo.length > 0) {
          callbackSuccess(graphInfo);
        } else {
          callbackFailure('No graph info could be derived');
        }
      }, function() {
        callbackFailure('The http requests failed');
      });
    };

    this.getDatasetByName = function(datasetName) {
      var result;
      this.datasets.forEach(function(dataset) {
        if (dataset.id === datasetName) {
          result = dataset;
        }
      });
      return result;
    };
  }

  angular.module('eWaterCycleApp.ncwms').service('NcwmsService', NcwmsService);
})();
