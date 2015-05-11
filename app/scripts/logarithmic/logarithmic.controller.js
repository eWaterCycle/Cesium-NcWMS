(function() {
  'use strict';

  function LogarithmicController($scope, Messagebus, UserAgent) {
    this.mobile = UserAgent.mobile;
    this.logarithmic = false;

    this.toggleLogarithmic = function() {
      this.logarithmic = !this.logarithmic;
      Messagebus.publish('logarithmicChange', this.logarithmic);
    };
    /*
            // Set watcher for change
            $scope.$watch('lc.logarithmic', function(newValue, oldValue) {
                if (newValue === oldValue) {
                    //Initialization, so we ignore this event.
                } else {
                    Messagebus.publish('logarithmicChange', newValue);
                }
            });
    */
    Messagebus.subscribe('logarithmicChange', function(event, value) {
      if (value !== this.logarithmic) {
        this.logarithmic = value;
      }
    }.bind(this));
  }

  angular.module('eWaterCycleApp.logarithmic').controller('LogarithmicController', LogarithmicController);
})();
