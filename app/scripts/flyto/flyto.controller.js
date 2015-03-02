(function() {
  'use strict';

  function FlyToController($http, Messagebus) {
        var me = this;
        this.selectedCountry = {};

        this.data = {
            'locations' : {}
        };

        // load JSON data
        $http.get('../bower_components/countries/countries.json').then(function(res) {
            me.data.locations.countries = res.data;
        });

        this.selectCountry = function(item) {
            this.selectedCountry = item;
            this.flyToCountry(item, false);
        };

        this.flyToCountry = function(countryToFlyTo, defaultHeight) {
            Messagebus.publish('cesiumFlyToCountry', {
                country:countryToFlyTo, 
                height:defaultHeight}
            );
        };
    }

  angular.module('eWaterCycleApp.flyTo').controller('FlyToController', FlyToController);
})();
