(function() {
  'use strict';

    function OutlinesController($scope, $http, Cesium, CesiumViewerService, Messagebus) {        
        this.outlines = false;   
        this.entities = [];
                    
        // Set watcher for change
        $scope.$watch('ol.outlines', function(newValue, oldValue) {
            if (newValue === oldValue) {
                //Initialization, so we ignore this event.
            } else {                
                Messagebus.publish('outlinesChange', newValue);
            }
        });
        Messagebus.subscribe('outlinesChange', function(event, value) {   
            this.entities.forEach(function(entity) {
                entity.polygon.show = new Cesium.ConstantProperty(value);
            });
            
            if (value !== this.outlines) {    
                this.outlines = value;
            }
        }.bind(this));
    
        this.init = function() {
            $http.get('bower_components/countries/countries.json').then(function(res) {
                res.data.forEach(function(country) {
                    // console.log(country.cca3.toLowerCase());

                    // Create a new GeoJSON data source and add it to the list.
                    var dataSource = new Cesium.GeoJsonDataSource();
                    CesiumViewerService.viewer.dataSources.add(dataSource);
                    
                    var interiorColor = new Cesium.Color(1.0, 1.0, 1.0, 0.0);
                    var outlineColor = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    // Load the document into the data source and then set custom graphics
                    dataSource.loadUrl('bower_components/countries/data/' + country.cca3.toLowerCase() + '.geo.json').then(function() {
                        // Get the array of entities
                        var entities = dataSource.entities.entities;
                        entities.forEach(function(entity) {
                            entity.polygon.material = Cesium.ColorMaterialProperty.fromColor(interiorColor);
                            entity.polygon.outlineColor = Cesium.ColorMaterialProperty.fromColor(outlineColor);
                            entity.polygon.show = new Cesium.ConstantProperty(false);
                            
                            this.entities.push(entity);
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }.bind(this));        
        };
        
        this.init();
    }

    angular.module('eWaterCycleApp.outlines').controller('OutlinesController', OutlinesController);
})();
