(function() {
    'use strict';

    function LineGraphController($scope, $window, $timeout, $http, d3Service) {
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

          var margin = parseInt(attrs.margin) || 0;

          // Browser onresize event
          window.onresize = function() {
            $scope.$apply();
          };

          // Watch for resize event
          //$scope.$watch(function() {
          //  return angular.element($window)[0].innerWidth;
          //}, function() {
          //  $scope.render(this.data);
          //}.bind(this));

          //$scope.$watch('data', function(newData) {
          //  $scope.render(newData);
          //}, true);

          var parseDate  = d3.time.format('%Y-%m-%d').parse;
          $http.get('scripts/linegraph/data.json').then(function(rawData) {
            var data = rawData.data.map(function (d) {
              return {
                date:  parseDate(d.date),
                pct05: d.pct05 / 1000,
                pct25: d.pct25 / 1000,
                pct50: d.pct50 / 1000,
                pct75: d.pct75 / 1000,
                pct95: d.pct95 / 1000
              };
            });
            $scope.render(data);
          }.bind(this));

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

              this.addAxesAndLegend = function(svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
                var legendWidth  = chartWidth/10,
                    legendHeight = chartHeight/10;

                // clipping to make sure nothing appears behind legend
                svg.append('clipPath')
                  .attr('id', 'axes-clip')
                  .append('polygon')
                    .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                                    (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                                    (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                                    (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                                    (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                                    (-margin.left)                 + ',' + (chartHeight + margin.bottom));

                var axes = svg.append('g')
                  .attr('clip-path', 'url(#axes-clip)');

                axes.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(0,' + chartHeight + ')')
                  .call(xAxis);

                axes.append('g')
                  .attr('class', 'y axis')
                  .call(yAxis)
                  .append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', 6)
                    .attr('dy', '.71em')
                    .style('text-anchor', 'end')
                    .text('Time (s)');
/*
                var legend = svg.append('g')
                  .attr('class', 'legend')
                  .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');

                legend.append('rect')
                  .attr('class', 'legend-bg')
                  .attr('width',  legendWidth)
                  .attr('height', legendHeight);

                legend.append('rect')
                  .attr('class', 'outer')
                  .attr('width',  75)
                  .attr('height', 20)
                  .attr('x', 10)
                  .attr('y', 10);

                legend.append('text')
                  .attr('x', 115)
                  .attr('y', 25)
                  .text('5% - 95%');

                legend.append('rect')
                  .attr('class', 'inner')
                  .attr('width',  75)
                  .attr('height', 20)
                  .attr('x', 10)
                  .attr('y', 40);

                legend.append('text')
                  .attr('x', 115)
                  .attr('y', 55)
                  .text('25% - 75%');

                legend.append('path')
                  .attr('class', 'median-line')
                  .attr('d', 'M10,80L85,80');

                legend.append('text')
                  .attr('x', 115)
                  .attr('y', 85)
                  .text('Median');
*/
              };

              this.drawPaths = function(svg, data, x, y) {
                var upperOuterArea = d3.svg.area()
                  .interpolate('basis')
                  .x (function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct95); })
                  .y1(function (d) { return y(d.pct75); });

                var upperInnerArea = d3.svg.area()
                  .interpolate('basis')
                  .x (function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct75); })
                  .y1(function (d) { return y(d.pct50); });

                var medianLine = d3.svg.line()
                  .interpolate('basis')
                  .x(function (d) { return x(d.date); })
                  .y(function (d) { return y(d.pct50); });

                var lowerInnerArea = d3.svg.area()
                  .interpolate('basis')
                  .x (function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct50); })
                  .y1(function (d) { return y(d.pct25); });

                var lowerOuterArea = d3.svg.area()
                  .interpolate('basis')
                  .x (function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct25); })
                  .y1(function (d) { return y(d.pct05); });

                svg.datum(data);

                svg.append('path')
                  .attr('class', 'area upper outer')
                  .attr('d', upperOuterArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'area lower outer')
                  .attr('d', lowerOuterArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'area upper inner')
                  .attr('d', upperInnerArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'area lower inner')
                  .attr('d', lowerInnerArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'median-line')
                  .attr('d', medianLine)
                  .attr('clip-path', 'url(#rect-clip)');
              };

              this.startTransitions = function(svg, chartWidth, chartHeight, rectClip) {
                rectClip.transition()
                  .duration(1000)
                  .attr('width', chartWidth);
              };

              this.makeChart = function(data) {
                var svgWidth  = width,
                    svgHeight = width/2,
                    margin = { top: 0, right: 0, bottom: 10, left: 10 },
                    chartWidth  = svgWidth  - margin.left - margin.right,
                    chartHeight = svgHeight - margin.top  - margin.bottom;

                var x = d3.time.scale().range([0, chartWidth])
                  .domain(d3.extent(data, function (d) { return d.date; }));
                var y = d3.scale.linear().range([chartHeight, 0])
                  .domain([0, d3.max(data, function (d) { return d.pct95; })]);

                var xAxis = d3.svg.axis().scale(x).orient('bottom')
                  .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10);
                var yAxis = d3.svg.axis().scale(y).orient('left')
                  .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

                svg.attr('width',  svgWidth)
                  .attr('height', svgHeight)
                  .append('g')
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                // clipping to start chart hidden and slide it in later
                var rectClip = svg.append('clipPath')
                  .attr('id', 'rect-clip')
                  .append('rect')
                  .attr('width', 0)
                  .attr('height', chartHeight);

                this.addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
                this.drawPaths(svg, data, x, y);
                this.startTransitions(svg, chartWidth, chartHeight, rectClip);
              };

              this.makeChart(data);
            }.bind(this), 400);
          }.bind(this);
        }.bind(this));
      }.bind(this);
    }

    angular.module('eWaterCycleApp.linegraph').controller('LineGraphController', LineGraphController);
})();
