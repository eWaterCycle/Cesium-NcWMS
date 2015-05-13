(function() {
  'use strict';

  function HelpModalController(UserAgent, Messagebus) {
    this.mobile = UserAgent.mobile;
    this.everClosed = false;

    this.init = function() {
      angular.element('#helpModal').modal(
        {
          'show' : 'true'
        }
      );
    };

    this.onClose = function() {
      if (!this.everClosed) {
        Messagebus.publish('cesiumCoordinatesClicked', {
          'latitude': -0.04430155381687794,
          'longitude': 0.2832850578129212,
          'leftTopLat': -3.5382920595787892,
          'leftTopLon': 15.231038211799913,
          'rightBottomLat': -1.5382920595787892,
          'rightBottomLon': 17.231038211799913
        });

        Messagebus.publish('flyToCountryByName', 'DR Congo');
      }

      this.everClosed = true;
    }
  }

  angular.module('eWaterCycleApp.helpModal').controller('HelpModalController', HelpModalController);
})();
