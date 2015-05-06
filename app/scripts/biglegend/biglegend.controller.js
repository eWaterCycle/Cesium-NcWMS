(function() {
  'use strict';

  function BigLegendController($scope, DecimalAdjust, Messagebus) {
    this.legendText = [40, 30, 20, 10];

    this.logarithmic = [];
    Messagebus.subscribe('logarithmicChange', function(event, value) {
      if (value.layerId === 0) {
        this.logarithmic[value.layerId] = value.logarithmic;
      }
    }.bind(this));

    //Define the legend max initial value
    this.legendMin = 0;
    //Subscribe to the message bus for changes to this value.
    Messagebus.subscribe('legendMinChange', function(event, value) {
      if (value.layerId === 0) {
        this.legendMin = value.min;
        this.setLegendText();
      }
    }.bind(this));

    // Set watcher for change on the legend min setting, use it to publish changes.
    $scope.$watch('blc.legendMin', function(newValue, oldValue) {
      if (newValue === oldValue) {
        //Initialization, so we ignore this event.
      } else {
        Messagebus.publish('legendMinChange', {
          'layerId': 0,
          'min': newValue
        });
      }
    });

    //Define the legend max initial value
    this.legendMax = 50;
    //Subscribe to the message bus for changes to this value.
    Messagebus.subscribe('legendMaxChange', function(event, value) {
      if (value.layerId === 0) {
        this.legendMax = value.max;
      this.setLegendText();
    }
    }.bind(this));
    // Set watcher for change on the legend max setting, use it to publish changes.
    $scope.$watch('blc.legendMax', function(newValue, oldValue) {
      if (newValue === oldValue) {
        //Initialization, so we ignore this event.
      } else {
        Messagebus.publish('legendMaxChange', {
          'layerId': 0,
          'max': newValue
        });
      }
    });

    Messagebus.subscribe('ncwmsPaletteSelected', function(event, value) {
      if (value.layerId === 0) {
        this.setOnload(value.palette.graphic);
      }
    }.bind(this));


    this.selectedUnits = 'cm above average';
    Messagebus.subscribe('ncwmsUnitsChange', function(event, value) {
      if (value.layerId === 0) {
        this.selectedUnits = value.units;
      }
    }.bind(this));

    this.setLegendText = function() {
      var diff = this.legendMax - this.legendMin;
      var interval = 0.2 * diff;

      if (!this.logarithmic[0]) {
        this.legendText[3] = Math.round10((this.legendMin + interval), -2);
        this.legendText[2] = Math.round10((this.legendMin + 2 * interval), -2);
        this.legendText[1] = Math.round10((this.legendMin + 3 * interval), -2);
        this.legendText[0] = Math.round10((this.legendMin + 4 * interval), -2);
      } else {
        var logmin = Math.log10(this.legendMin);
        var logmax = Math.log10(this.legendMax);

        this.legendText[3] = Math.round10((Math.pow(10, 0.8 * logmin + 0.2 * logmax)), -2);
        this.legendText[2] = Math.round10((Math.pow(10, 0.6 * logmin + 0.4 * logmax)), -2);
        this.legendText[1] = Math.round10((Math.pow(10, 0.4 * logmin + 0.6 * logmax)), -2);
        this.legendText[0] = Math.round10((Math.pow(10, 0.2 * logmin + 0.8 * logmax)), -2);
      }
    }.bind(this);

    this.setOnload = function(imgURL) {
      var context = document.getElementById('bigLegendCanvas').getContext('2d');
      var img = new Image();
      img.src = imgURL;

      img.onload = function() {
        context.canvas.width = 10;
        context.canvas.height = 150;

        context.drawImage(img, 0, 0);
      };
    };
  }

  angular.module('eWaterCycleApp.biglegend').controller('BigLegendController', BigLegendController);
})();
