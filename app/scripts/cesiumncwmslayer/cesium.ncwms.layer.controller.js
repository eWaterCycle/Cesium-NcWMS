(function() {
    'use strict';

    function CesiumNcwmsLayerController(Cesium, CesiumViewerService, NcwmsService, Messagebus) {
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
            var closest = NcwmsService.datasets[NcwmsService.datasets.indexOf(this.selectedDataset)].datesWithData[0];
            
            NcwmsService.datasets[NcwmsService.datasets.indexOf(this.selectedDataset)].datesWithData.forEach(function(date) {
                if (date < value) {
                    closest = date;
                }
            });

            Messagebus.publish('ncwmsTimeSelected', closest);
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
                service : 'WMS',
                version : '1.3.0',
                request : 'GetMap',
                CRS : 'CRS:84',
                styles : this.selectedDataset.metaData.supportedStyles[0] + '/' + this.selectedPalette.name,
                format : 'image/png',
                LOGSCALE : this.logarithmic
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
                        url : NcwmsService.ncWMSURL,
                        layers : this.selectedDataset.id,
                        parameters : parameters
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
                        url : NcwmsService.ncWMSURL,
                        layers : this.selectedDataset.id,
                        parameters : parameters
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
