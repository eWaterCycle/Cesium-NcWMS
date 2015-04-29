(function() {
  'use strict';

    function DatasetController($scope, NcwmsService, Messagebus) {
        this.getDatasets = function() {
            return NcwmsService.datasets;
        };

        this.selectedDataset = 'default';
        Messagebus.subscribe('ncwmsDatasetSelected', function(event, value) {
            if (this.selectedDataset !== value.dataset) {
                this.selectedDataset = value.dataset;
            }
        }.bind(this));

        this.selectDataset = function(dataset) {
            Messagebus.publish('ncwmsDatasetSelected', {'layerId':$scope.layerId, 'dataset':dataset)};

            var datasetForMap = this.selectedDataset;
            if (this.selectedDataset.statsGroup) {
              datasetForMap = this.selectedDataset.datasetMean;
            }

            Messagebus.publish('ncwmsUnitsChange', {'layerId':$scope.layerId, 'units':datasetForMap.units});
            Messagebus.publish('legendMinChange', {'layerId':$scope.layerId, 'min':datasetForMap.min});
            Messagebus.publish('legendMaxChange', {'layerId':$scope.layerId, 'max':datasetForMap.max});

            // if (dataset.graphicalMin !== 0) {
            //   Messagebus.publish('graphMinChange', dataset.graphicalMin);
            //   Messagebus.publish('graphMaxChange', dataset.graphicalMax);
            // } else {
            //   Messagebus.publish('graphMinChange', dataset.min);
            //   Messagebus.publish('graphMaxChange', dataset.max);
            // }
        };
    }

  angular.module('eWaterCycleApp.dataset').controller('DatasetController', DatasetController);
})();
