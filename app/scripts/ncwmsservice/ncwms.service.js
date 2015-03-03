(function() {
    'use strict';

    function NcwmsService($q, $http, Messagebus) {  
        this.ncWMSURL = 'http://localhost:8080/ncWMS-2.0-rc1-maartenvm/wms?';
                
        this.initialized = false;
      
        this.ncWMSdata = {
            'metadata' : {},
            'palettes' : []
        };
        this.datasets = [];    

        this.selectedDataset = 'default';        
        
        this.init = function() {
            // Ask the server to give us the data we need to get started, in
            // this case an overview of the available datasets
            this.getMenu().then(function success(menuPromise) {
                // Build an array containing our datasets (--NG--)
                this.datasets = this.loadMenu(menuPromise);
                // Store the first dataset as our 'currently selected' dataset
                // (--NG--)
                this.selectedDataset = this.datasets[0];
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
                        this.datasets[this.datasets.indexOf(dataset)].metaData = metaDataPromise.data;

                        // Once the metadata request is resolved, store the
                        // dates with
                        // data in
                        // the previously made datasets datastructure.
                        var dates = [];
                        if (metaDataPromise.data.supportsTimeseries) {
                            for ( var year in metaDataPromise.data.datesWithData) {
                                var monthArray = metaDataPromise.data.datesWithData[year];
                                for ( var month in monthArray) {
                                    var dayArray = monthArray[month];
                                    for ( var day in dayArray) {
                                        dates.push(new Date(Date.UTC(year, month, dayArray[day], 0, 0, 0)));
                                    }
                                }
                            }
                        }
                        this.datasets[this.datasets.indexOf(dataset)].datesWithData = dates;

                        // Store the scale ranges
                        this.datasets[this.datasets.indexOf(dataset)].min = parseFloat(metaDataPromise.data.scaleRange[0]);
                        this.datasets[this.datasets.indexOf(dataset)].max = parseFloat(metaDataPromise.data.scaleRange[1]);

                        this.datasets[this.datasets.indexOf(dataset)].units = metaDataPromise.data.units;
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
                    var dates = this.datasets[this.datasets.indexOf(this.selectedDataset)].datesWithData;

                    var startDate = dates[0];
                    var endDate = dates[this.datasets[this.datasets.indexOf(this.selectedDataset)].datesWithData.length - 1];
                    
                    Messagebus.publish('timeFrameRedefined', {
                        start : startDate,
                        stop : endDate
                    });
                    Messagebus.publish('ncwmsTimeSelected', startDate);
                    
                    Messagebus.publish('ncwmsUnitsChange', this.selectedDataset.units);
                    Messagebus.publish('legendMinChange', this.selectedDataset.min);
                    Messagebus.publish('legendMaxChange', this.selectedDataset.max);
                    
                    //$scope.timelineWidget.zoomTo(startDate, endDate);

                    // Fill the array with legend texts
                    // $scope.setLegendText($scope.selectedDataset.min,
                    // $scope.selectedDataset.max, $scope.logarithmic);
                    // $scope.selectedUnits = $scope.selectedDataset.units;

                    // Now that everything is loaded, start watching for changes in
                    // the settings

                    //$scope.legendMin = $scope.selectedDataset.min;
                    //$scope.legendMax = $scope.selectedDataset.max;

                    //fliplegend($scope.selectedPalette.graphic, "dropdown_canvas");
                    //bigLegend($scope.selectedPalette.graphic, "bigLegend_canvas");

                    //setLegendText($scope);
                    //repaintColorMap($scope);

                    //setWatchers();
                                       
                    this.initialized = true;
                    Messagebus.publish('ncwmsLoadingComplete', true);
                }.bind(this));

            }.bind(this), function error(msg) {
                console.log('Error in getMenu, ' + msg);
            });
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
                        result.push({
                            id : child.id,
                            label : dataSetLabel + '/' + child.label,
                            datesWithData : {},
                            min : 0.0,
                            max : 0.0,
                            units : {}
                        });
                        if (child.children !== undefined) {
                            child.children.forEach(function(grandChild) {
                                if (grandChild.plottable) {
                                    result.push({
                                        id : grandChild.id,
                                        label : dataSetLabel + '/' + grandChild.label,
                                        datesWithData : {},
                                        min : 0.0,
                                        max : 0.0,
                                        units : {}
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
                    name : paletteName,
                    graphic : imgURL2
                });
            }.bind(this));

            return result;
        };
        
        this.init();       
    }

    angular.module('eWaterCycleApp.ncwms').service('NcwmsService', NcwmsService);
})();