(function() {
  'use strict';

    function TerrainController($scope, Messagebus) {        
        this.terrain = true;

        // Set watcher for change
        $scope.$watch('tr.terrain', function(newValue, oldValue) {
            if (newValue === oldValue) {
                //Initialization, so we ignore this event.
            } else {
                Messagebus.publish('terrainChange', newValue);
            }
        });
    }

  angular.module('eWaterCycleApp.terrain').controller('TerrainController', TerrainController);
})();
