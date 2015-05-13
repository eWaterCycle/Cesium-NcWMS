(function() {
  'use strict';

  function LogarithmicController($scope, Messagebus, UserAgent) {
    this.mobile = UserAgent.mobile;

    this.logarithmic = $scope.activated;

    this.toggleLogarithmic = function() {
      this.logarithmic = !this.logarithmic;
      Messagebus.publish('logarithmicChange', this.logarithmic);
    };

    Messagebus.subscribe('logarithmicChange', function(event, value) {
      if (value !== this.logarithmic) {
        this.logarithmic = value;
      }
    }.bind(this));
  }

  angular.module('eWaterCycleApp.logarithmic').controller('LogarithmicController', LogarithmicController);
})();
