(function() {
    'use strict';

    function iAmLegend() {
        return {
            restrict : 'A',
            link : function(scope, element) {
                var ctx = element[0].getContext('2d');

                var img = new Image();
                img.src = scope.choice.graphic;

                img.onload = function() {
                    ctx.canvas.width = 150;
                    ctx.canvas.height = 10;

                    ctx.translate(150, 0);
                    ctx.rotate(-1.5 * Math.PI);
                    ctx.drawImage(img, 0, 0);
                };
            }
        };
    }

  angular.module('eWaterCycleApp.palette').directive('iAmLegend', iAmLegend);
})();