(function() {
    'use strict';
      
    //Utility modules
    angular.module('math', [])
      .factory('Math', function($window) {
        return $window.Math;
      });    
    angular.module('eWaterCycleApp.utils', []);   
    
    //Modules dependent on ncwms
    angular.module('eWaterCycleApp.ncwms', [ 'eWaterCycleApp.utils' ]);    
    angular.module('eWaterCycleApp.palette', [ 'eWaterCycleApp.ncwms', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.dataset', [ 'eWaterCycleApp.ncwms', 'eWaterCycleApp.utils' ]);
    
    //Modules dependent on wms
    //angular.module('eWaterCycleApp.wms', [ 'eWaterCycleApp.utils' ]);    
    
    //Modules dependent on cesium
    angular.module('cesium', [])
      .factory('Cesium', function($window) {
        return $window.Cesium;
      }); 
    angular.module('eWaterCycleApp.cesiumViewer', [ 'cesium', 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.outlines', [ 'cesium', 'eWaterCycleApp.cesiumViewer', 'eWaterCycleApp.utils' ]);
    
    //Modules dependent on ncwms AND cesium    
    angular.module('eWaterCycleApp.cesiumNcwmsLayer', [ 'cesium', 'eWaterCycleApp.cesiumViewer', 'eWaterCycleApp.ncwms', 'eWaterCycleApp.utils' ]);    
    
    //Modules dependent on wms AND cesium    
    //angular.module('eWaterCycleApp.cesiumWmsLayer', [ 'cesium', 'eWaterCycleApp.cesiumViewer', 'eWaterCycleApp.wms', 'eWaterCycleApp.utils' ]);   
    
    //Standalone modules   
    angular.module('eWaterCycleApp.viewmodel', [ 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.flyTo', [ 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.logarithmic', [ 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.terrain', [ 'eWaterCycleApp.utils' ]);
    angular.module('eWaterCycleApp.biglegend', [ 'math', 'eWaterCycleApp.utils' ]);
    
    //Project logos etc.
    angular.module('eWaterCycleApp.logos', []);
    angular.module('eWaterCycleApp.projectlogo', []);
    
    //Tying it all together
    angular.module('eWaterCycleApp', [ 
        'ui.bootstrap', 
        
        //Modules dependent on ncwms
        'eWaterCycleApp.ncwms',
        'eWaterCycleApp.palette', 
        'eWaterCycleApp.dataset', 
        
        //Modules dependent on wms
        //'eWaterCycleApp.wms',
        
        //Modules dependent on cesium
        'eWaterCycleApp.cesiumViewer',
        'eWaterCycleApp.viewmodel', 
        'eWaterCycleApp.flyTo', 
        'eWaterCycleApp.outlines', 
        
        //Modules dependent on ncwms AND cesium   
        'eWaterCycleApp.cesiumNcwmsLayer', 
        
        //Modules dependent on wms AND cesium   
        //'eWaterCycleApp.cesiumWmsLayer', 
        
        //Standalone modules
        'eWaterCycleApp.logarithmic',
        'eWaterCycleApp.terrain',
        'eWaterCycleApp.biglegend',        
        
        //Project logos etc.
        'eWaterCycleApp.logos', 
        'eWaterCycleApp.projectlogo' 
    ]);
})();