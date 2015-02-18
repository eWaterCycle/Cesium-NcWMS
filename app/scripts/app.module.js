(function() {
    'use strict';
      
    angular.module('cesium', [])
      .factory('Cesium', function($window) {
        return $window.Cesium;
      });
      
    angular.module('eWaterCycleApp.cesiumViewer', [ 'cesium' ]);
    angular.module('eWaterCycleApp.viewmodel', [ 'eWaterCycleApp.cesiumViewer' ]);
    angular.module('eWaterCycleApp.flyTo', [ 'cesium', 'eWaterCycleApp.cesiumViewer' ]);
    angular.module('eWaterCycleApp.outlines', [ 'eWaterCycleApp.cesiumViewer' ]);
    angular.module('eWaterCycleApp.biglegend', [ 'eWaterCycleApp.cesiumViewer' ]);
    angular.module('eWaterCycleApp.logos', []);
    angular.module('eWaterCycleApp.projectlogo', []);
    
    angular.module('eWaterCycleApp', [ 
        'ui.bootstrap', 
        'eWaterCycleApp.flyTo', 
        'eWaterCycleApp.viewmodel', 
        'eWaterCycleApp.outlines', 
        'eWaterCycleApp.biglegend',
        'eWaterCycleApp.logos', 
        'eWaterCycleApp.projectlogo' 
    ]);
})();