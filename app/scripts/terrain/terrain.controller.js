(function() {
  'use strict';

    function TerrainController($scope, Messagebus) {        
        this.terrain = true;

        // Set watcher for change
        $scope.$watch('tr.terrain', function(newValue, oldValue) {
            if (newValue === oldValue) {
                //Initialization, so we ignore this event.
            } else {
                this.terrain = newValue;
                Messagebus.publish('terrainChange', newValue);
            }
        });
        
        Messagebus.subscribe('terrainChange', function(event, value) {              
            if (value !== this.terrain) {    
                this.terrain = value;
            }
        }.bind(this));
    }

  angular.module('eWaterCycleApp.terrain').controller('TerrainController', TerrainController);
})();
