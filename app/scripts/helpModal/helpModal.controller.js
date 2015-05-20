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
          'latitude': 0.3743970603556857,
          'longitude':1.6634872646065932,
          'leftTopLat': 20.451371420485543,
          'leftTopLon': 94.3107995357198,
          'rightBottomLat': 22.451371420485543,
          'rightBottomLon': 96.3107995357198
        });

        Messagebus.publish('flyToCountryByName', 'Myanmar');
      }

      this.everClosed = true;
    }
  }

  angular.module('eWaterCycleApp.helpModal').controller('HelpModalController', HelpModalController);
})();
