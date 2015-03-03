(function() {
    'use strict';

    function CesiumWmsLayerController(Cesium, CesiumViewerService, WmsService, Messagebus) {
        this.selectedTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
        Messagebus.subscribe('wmsTimeSelected', function(event, value) {
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
        
        this.selectedDataset = 'Bangalore:blr_roads';
        Messagebus.subscribe('wmsDatasetSelected', function(event, value) {            
            if (this.selectedDataset !== value) {
                this.selectedDataset = value;
                this.repaintColorMap();
            }
        }.bind(this));

        this.selectedPalette = 'default';
        Messagebus.subscribe('wmsPaletteSelected', function(event, value) {            
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

        Messagebus.subscribe('wmsLoadingComplete', function(event, value) {
            if (value === true) {                
                this.repaintColorMap();
            }
        }.bind(this));  

        var colorMapLayer;
        
        this.repaintColorMap = function() {
            if (!WmsService.initialized) {
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
                //styles : '', //this.selectedDataset.metaData.supportedStyles[0] + '/' + this.selectedPalette.name,
                format : 'image/png',
                //LOGSCALE : this.logarithmic
            };

            if (this.selectedDataset) {
               if (this.terrain) {
                    parameters.TRANSPARENT = 'true';
                    parameters.BGCOLOR = '000000';

                    colorMapLayer = CesiumViewerService.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                        url : WmsService.wmsURL,
                        layers : this.selectedDataset,
                        parameters : parameters
                    }));

                    colorMapLayer.alpha = 0.3;
                    colorMapLayer.brightness = 2.0;
                } else {
                    parameters.TRANSPARENT = 'false';
                    parameters.BGCOLOR = '000000';

                    colorMapLayer = CesiumViewerService.viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                        url : WmsService.wmsURL,
                        layers : this.selectedDataset,
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
        
        this.repaintColorMap();
    }
    
    angular.module('eWaterCycleApp.cesiumWmsLayer').controller('CesiumWmsLayerController', CesiumWmsLayerController);
})();
