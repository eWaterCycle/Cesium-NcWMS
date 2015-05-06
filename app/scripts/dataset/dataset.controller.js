(function() {
  'use strict';

    function DatasetController($scope, NcwmsService, Messagebus) {
      this.getDatasets = function() {
        return NcwmsService.datasets;
      };

      this.selectedDatasets = [];

      Messagebus.subscribe('ncwmsDatasetSelected', function(event, value) {
        if (value.layerId === $scope.layerId && this.selectedDataset !== value.dataset) {
          this.selectedDatasets[$scope.layerId] = value.dataset;
        }
      }.bind(this));

      this.selectDataset = function(dataset) {
        Messagebus.publish('ncwmsDatasetSelected', {'layerId':$scope.layerId, 'dataset':dataset});

        var datasetForMap = this.selectedDatasets[$scope.layerId];
        if (this.selectedDatasets[$scope.layerId].statsGroup) {
          datasetForMap = this.selectedDatasets[$scope.layerId].datasetMean;
        }

        Messagebus.publish('ncwmsUnitsChange', {'layerId':$scope.layerId, 'units':datasetForMap.units});
        Messagebus.publish('legendMinChange', {'layerId':$scope.layerId, 'min':datasetForMap.min});
        Messagebus.publish('legendMaxChange', {'layerId':$scope.layerId, 'max':datasetForMap.max});
      };
    }

  angular.module('eWaterCycleApp.dataset').controller('DatasetController', DatasetController);
})();
