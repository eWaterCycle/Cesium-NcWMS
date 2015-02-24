(function() {
  'use strict';

    function DatasetController(CesiumViewerService, NcwmsService, Messagebus) {        
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
        }; 
    }

  angular.module('eWaterCycleApp.dataset').controller('DatasetController', DatasetController);
})();
