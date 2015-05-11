(function() {
  'use strict';

  function FlyToController($http, Messagebus, UserAgent) {
    this.mobile = UserAgent.mobile;
    
    var me = this;
    this.selectedCountry = {};

    this.data = {
      'locations': {}
    };

    this.init = function() {
      // load JSON data
      $http.get('bower_components/countries/countries.json').then(function(res) {
        me.data.locations.countries = res.data;
      });
    };
    this.init();

    this.selectCountry = function(item) {
      this.selectedCountry = item;
      this.flyToCountry(item, false);
    };

    this.flyToCountry = function(countryToFlyTo, defaultHeight) {
      Messagebus.publish('cesiumFlyToCountry', {
        country: countryToFlyTo,
        height: defaultHeight ? 10000000 : 10000000
      });
    };
  }

  angular.module('eWaterCycleApp.flyTo').controller('FlyToController', FlyToController);
})();
