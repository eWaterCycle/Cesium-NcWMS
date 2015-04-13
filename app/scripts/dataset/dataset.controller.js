(function() {
  'use strict';

  function DatasetController(NcwmsService, Messagebus, UserAgent) {
    this.mobile = UserAgent.mobile;

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

      var datasetForMap = this.selectedDataset;
      if (this.selectedDataset.statsGroup) {
        datasetForMap = this.selectedDataset.datasetMean;
      }

      Messagebus.publish('ncwmsUnitsChange', datasetForMap.units);
      Messagebus.publish('legendMinChange', datasetForMap.min);
      Messagebus.publish('legendMaxChange', datasetForMap.max);
    };
  }

  angular.module('eWaterCycleApp.dataset').controller('DatasetController', DatasetController);
})();
