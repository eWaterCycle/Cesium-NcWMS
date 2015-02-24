(function() {
    'use strict';
      
    angular.module('math', [])
      .factory('Math', function($window) {
        return $window.Math;
      });
      
    angular.module('cesium', [])
      .factory('Cesium', function($window) {
        return $window.Cesium;
      });      
    
    angular.module('eWaterCycleApp.utils', []);   
    angular.module('eWaterCycleApp.ncwms', [ 'eWaterCycleApp.utils' ]);    
    angular.module('eWaterCycleApp.cesiumViewer', [ 'cesium', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.cesiumNcwmsLayer', [ 'cesium', 'eWaterCycleApp.cesiumViewer', 'eWaterCycleApp.ncwms', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.dataset', [ 'eWaterCycleApp.cesiumViewer', 'eWaterCycleApp.ncwms', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.palette', [ 'eWaterCycleApp.ncwms', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.viewmodel', [ 'eWaterCycleApp.cesiumViewer' ]);
    angular.module('eWaterCycleApp.flyTo', [ 'cesium', 'eWaterCycleApp.cesiumViewer' ]);
    angular.module('eWaterCycleApp.logarithmic', [ 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.terrain', [ 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.outlines', [ 'cesium', 'eWaterCycleApp.cesiumViewer', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.biglegend', [ 'math', 'eWaterCycleApp.cesiumViewer', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.logos', []);
    angular.module('eWaterCycleApp.projectlogo', []);
    
    angular.module('eWaterCycleApp', [ 
        'ui.bootstrap', 
        'eWaterCycleApp.ncwms',
        'eWaterCycleApp.cesiumViewer',
        'eWaterCycleApp.cesiumNcwmsLayer', 
        'eWaterCycleApp.dataset', 
        'eWaterCycleApp.palette', 
        'eWaterCycleApp.viewmodel', 
        'eWaterCycleApp.flyTo', 
        'eWaterCycleApp.logarithmic',
        'eWaterCycleApp.terrain',
        'eWaterCycleApp.outlines', 
        'eWaterCycleApp.biglegend',
        'eWaterCycleApp.logos', 
        'eWaterCycleApp.projectlogo' 
    ]);
})();