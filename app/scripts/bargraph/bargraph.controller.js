(function() {
    'use strict';

    function BarGraphController($scope, $window, $timeout, d3Service) {
      this.data = [
        {name: 'Greg', score: 98},
        {name: 'Ari', score: 96},
        {name: 'Q', score: 75},
        {name: 'Loser', score: 48}
      ];

      this.init = function(element, attrs) {
        d3Service.d3().then(function(d3) {
          var renderTimeout;
          var svg = d3.select(element.children[0]).append('svg').style('width', '100%');

          var margin = parseInt(attrs.margin) || 20;
          var barHeight = parseInt(attrs.barHeight) || 20;
          var barPadding = parseInt(attrs.barPadding) || 5;

          // Browser onresize event
          window.onresize = function() {
            $scope.$apply();
          };

          // Watch for resize event
          $scope.$watch(function() {
            return angular.element($window)[0].innerWidth;
          }, function() {
            $scope.render(this.data);
          }.bind(this));

          $scope.$watch('data', function(newData) {
            $scope.render(newData);
          }, true);

          $scope.render = function(data) {
            // remove all previous items before render
            svg.selectAll('*').remove();

            // If we don't pass any data, return out of the element
            if (!data) {
              return;
            }

            if (renderTimeout) {
              clearTimeout(renderTimeout);
            }

            renderTimeout = $timeout(function() {
              // setup variables
              var width = d3.select(element)[0][0].children[0].offsetWidth - margin;
              // calculate the height
              var height = data.length * (barHeight + barPadding);
              // Use the category20() scale function for multicolor support
              var color = d3.scale.category20();
              // our xScale
              var xScale = d3.scale.linear()
                .domain([0, d3.max(data, function(d) {
                  return d.score;
                })])
                .range([0, width]);

              // set the height based on the calculations above
              svg.attr('height', height);

              //create the rectangles for the bar chart
              svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('height', barHeight)
                .attr('width', 140)
                .attr('x', Math.round(margin/2))
                .attr('y', function(d,i) {
                  return i * (barHeight + barPadding);
                })
                .attr('fill', function(d) { return color(d.score); })
                .transition()
                  .duration(1000)
                  .attr('width', function(d) {
                    return xScale(d.score);
                  });
              svg.selectAll('text')
                .data(data)
                .enter()
                .append('text')
                .attr('fill', '#000')
                .attr('y', function(d,i) {
                  return i * (barHeight + barPadding) + 15;
                })
                .attr('x', 15)
                .text(function(d) {
                  return d.name + ' (scored: ' + d.score + ')';
                });
            }.bind(this), 200);
          }.bind(this);
        }.bind(this));
      }.bind(this);
    }

    angular.module('eWaterCycleApp.bargraph').controller('BarGraphController', BarGraphController);
})();
