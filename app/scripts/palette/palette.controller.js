(function() {
  'use strict';

    function PaletteController($scope, NcwmsService, Messagebus) {
        this.getNcWMSdata = function() {
            return NcwmsService.ncWMSdata;
        };

        this.selectedPalette = 'default';
        Messagebus.subscribe('ncwmsPaletteSelected', function(event, value) {
            if (this.selectedPalette !== value.palette) {
                this.selectedPalette = value.palette;
                this.setOnload(value.palette.graphic);
            }
        }.bind(this));

        this.selectPalette = function(palette) {
            Messagebus.publish('ncwmsPaletteSelected', {'layerId':$scope.layerId, 'palette':palette});
        };

        this.setOnload = function(imgURL) {
            var context = document.getElementById('paletteDropdownHeaderCanvas').getContext('2d');
            var img = new Image();
            img.src = imgURL;

            img.onload = function() {
                context.canvas.width = 150;
                context.canvas.height = 10;

                context.translate(150, 0);
                context.rotate(-1.5 * Math.PI);
                context.drawImage(img, 0, 0);
            };
        };
    }

  angular.module('eWaterCycleApp.palette').controller('PaletteController', PaletteController);
})();
