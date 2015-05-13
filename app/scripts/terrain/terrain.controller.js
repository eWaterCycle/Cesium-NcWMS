(function() {
  'use strict';

  function TerrainController($scope, Messagebus, UserAgent) {
    this.mobile = UserAgent.mobile;

    this.terrain = $scope.activated;

    this.toggleTerrain = function() {
      this.terrain = !this.terrain;
      Messagebus.publish('terrainChange', this.terrain);
    };

    Messagebus.subscribe('terrainChange', function(event, value) {
      if (value !== this.terrain) {
        this.terrain = value;
      }
    }.bind(this));
  }

  angular.module('eWaterCycleApp.terrain').controller('TerrainController', TerrainController);
})();
