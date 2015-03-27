(function() {
  'use strict';

    function DatasetController(NcwmsService, Messagebus) {
        this.getDatasets = function() {
            return NcwmsService.datasets;
        };

        this.selectedDataset = 'default';
        Messagebus.subscribe('ncwmsDatasetSelected', function(event, value) {
            if (this.selectedDataset !== value) {
                this.selectedDataset = value;
            }
        }.bind(this));

        this.selectDataset = function(dataset) {
            Messagebus.publish('ncwmsDatasetSelected', dataset);
            Messagebus.publish('ncwmsUnitsChange', dataset.units);
            Messagebus.publish('legendMinChange', dataset.min);
            Messagebus.publish('legendMaxChange', dataset.max);

            if (dataset.graphicalMin !== 0) {
              Messagebus.publish('graphMinChange', dataset.graphicalMin);
              Messagebus.publish('graphMaxChange', dataset.graphicalMax);
            } else {
              Messagebus.publish('graphMinChange', dataset.min);
              Messagebus.publish('graphMaxChange', dataset.max);
            }
        };
    }

  angular.module('eWaterCycleApp.dataset').controller('DatasetController', DatasetController);
})();
