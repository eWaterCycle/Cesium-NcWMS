(function() {
  'use strict';

    function OutlinesController($scope, $http, Cesium, CesiumViewerService, Messagebus) {
        this.outlines = false;
        this.values = [];
        
        this.toggleOutlines = function() {
          this.outlines = !this.outlines;
          Messagebus.publish('outlinesChange', this.outlines);
        };
/*
        // Set watcher for change
        $scope.$watch('ol.outlines', function(newValue, oldValue) {
            if (newValue === oldValue) {
                //Initialization, so we ignore this event.
            } else {
                this.outlines = newValue;
                Messagebus.publish('outlinesChange', newValue);
            }
        }.bind(this));
*/
        Messagebus.subscribe('outlinesChange', function(event, value) {
            this.values.forEach(function(entityValue) {
                entityValue.polygon.show = new Cesium.ConstantProperty(value);
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
                    $http.get('bower_components/countries/data/' + country.cca3.toLowerCase() + '.geo.json').then(function(res2) {
                        dataSource.load(res2.data).then(function() {
                            // Get the array of entities
                            var values = dataSource.entities.values;
                            values.forEach(function(value) {
                                value.polygon.material = new Cesium.ColorMaterialProperty(interiorColor);
                                value.polygon.outlineColor = new Cesium.ColorMaterialProperty(outlineColor);
                                value.polygon.show = new Cesium.ConstantProperty(false);

                                this.values.push(value);
                            }.bind(this));
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        };

        this.init();
    }

    angular.module('eWaterCycleApp.outlines').controller('OutlinesController', OutlinesController);
})();
