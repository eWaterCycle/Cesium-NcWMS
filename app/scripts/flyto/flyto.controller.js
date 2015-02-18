(function() {
  'use strict';

  function FlyToController($http, Cesium, cesiumViewerService) {
        var me = this;
        this.selectedCountry = {};

        this.data = {
            "locations" : {}
        };

        // load JSON data
        $http.get('../bower_components/countries/countries.json').then(function(res) {
            me.data.locations.countries = res.data;
        });

        this.selectCountry = function(item) {
            this.selectedCountry = item;
            this.flyToCountry(item, false);
        }

        this.flyToCountry = function(countryToFlyTo, defaultHeight) {
            cesiumViewerService.viewer.scene.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(countryToFlyTo.latlng[1], countryToFlyTo.latlng[0], defaultHeight ? 10000000 : Math.max(countryToFlyTo.area / Math.PI, 1000000))
            });
        }
    }

  angular.module('eWaterCycleApp.flyTo').controller('FlyToController', FlyToController);
})();
