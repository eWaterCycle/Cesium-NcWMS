(function() {
    'use strict';

    function BigLegendController(cesiumViewerService) {
        this.legendMin = 0;
        this.legendMax = 0;
        
        this.legendText = ['1','2','3','4','5'];
        
        this.selectedUnits = 'cm above average';
        
        /*
        // Set a watcher for a change on the uncertainty checkbox
        $watch('legendMax', function(newValue, oldValue) {
            setLegendMax($scope, newValue, oldValue);
        });
        $watch('legendMin', function(newValue, oldValue) {
            setLegendMin($scope, newValue, oldValue);
        });
        */
        
        function setOnload(imgURL, elementID) {
            var context = document.getElementById(elementID).getContext('2d');
            var img = new Image();
            img.src = imgURL;

            img.onload = function() {
                context.canvas.width = 10;
                context.canvas.height = 150;

                context.drawImage(img, 0, 0);
            };
        }
    }

    angular.module('eWaterCycleApp.biglegend').controller('BigLegendController', BigLegendController);
})();
