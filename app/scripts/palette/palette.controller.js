(function() {
  'use strict';

<<<<<<< HEAD
  function PaletteController(NcwmsService, Messagebus, UserAgent) {
    this.mobile = UserAgent.mobile;

    this.getNcWMSdata = function() {
      return NcwmsService.ncWMSdata;
    };

    this.selectedPalette = 'default';
    Messagebus.subscribe('ncwmsPaletteSelected', function(event, value) {
      if (this.selectedPalette !== value) {
        this.selectedPalette = value;
        this.setOnload(value.graphic);
      }
    }.bind(this));

    this.selectPalette = function(palette) {
      Messagebus.publish('ncwmsPaletteSelected', palette);
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
=======
    function PaletteController(NcwmsService, Messagebus) {
        this.getNcWMSdata = function() {
            return NcwmsService.ncWMSdata;
        };

        this.selectedPalette = 'default';
        Messagebus.subscribe('ncwmsPaletteSelected', function(event, value) {
            if (this.selectedPalette !== value) {
                this.selectedPalette = value;
                this.setOnload(value.graphic);
            }
        }.bind(this));

        this.selectPalette = function(palette) {
            Messagebus.publish('ncwmsPaletteSelected', palette);
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
>>>>>>> 6310eab69eaa64d3fb0268aa52634c82bdfd9980

  angular.module('eWaterCycleApp.palette').controller('PaletteController', PaletteController);
})();
