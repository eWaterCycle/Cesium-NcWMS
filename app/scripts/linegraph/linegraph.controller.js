(function() {
  'use strict';

  function LineGraphController($scope, $window, $timeout, $http, d3Service, Messagebus) {
    this.data = {};

    this.horizontalUnits = '';

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
        $scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          this.render(this.data);
        }.bind(this));

        var parseDate = d3.time.format('%Y-%m-%d').parse;
        $http.get('scripts/linegraph/data.json').then(function(rawData) {
          this.data = rawData.data.map(function(d) {
            return {
              date: parseDate(d.date),
              pct05: d.pct05 / 1000,
              pct25: d.pct25 / 1000,
              pct50: d.pct50 / 1000,
              pct75: d.pct75 / 1000,
              pct95: d.pct95 / 1000
            };
          });
          this.render(this.data);
        }.bind(this));

        var parseISO = d3.time.format.utc('%Y-%m-%dT%H:%M:%S.%L%Z').parse;
        Messagebus.subscribe('graphUpdateEvent', function(event, value) {
          this.data = value.map(function(d) {
            return {
              date: parseISO(d.time),
              pct05: d.value - d.error - d.error,
              pct25: d.value - d.error,
              pct50: d.value,
              pct75: d.value + d.error,
              pct95: d.value + d.error + d.error
            };
          }.bind(this));
          this.render(this.data);
        }.bind(this));

        this.legendMin = 0;
        Messagebus.subscribe('legendMinChange', function(event, value) {
          if (this.legendMin !== value) {
            this.legendMin = value;
          }
        }.bind(this));

        this.legendMax = 50;
        Messagebus.subscribe('legendMaxChange', function(event, value) {
          if (this.legendMax !== value) {
            this.legendMax = value;
          }
        }.bind(this));

        this.logarithmic = false;
        Messagebus.subscribe('logarithmicChange', function(event, value) {
          if (this.logarithmic !== value) {
            this.logarithmic = value;
          }
        }.bind(this));

        this.selectedUnits = 'cm above average';
        Messagebus.subscribe('ncwmsUnitsChange', function(event, value) {
            this.selectedUnits = value;
        }.bind(this));

        this.render = function(data) {
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
              svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + chartHeight + ')')
                .call(xAxis)

              svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text(this.selectedUnits);
            };

            this.drawPaths = function(svg, data, x, y) {
              var upperOuterArea = d3.svg.area()
                .interpolate('basis')
                .x(function(d) {
                  return x(d.date) || 1;
                }).y0(function(d) {
                  return y(d.pct95);
                }).y1(function(d) {
                  return y(d.pct75);
                });

              var upperInnerArea = d3.svg.area()
                .interpolate('basis')
                .x(function(d) {
                  return x(d.date) || 1;
                })
                .y0(function(d) {
                  return y(d.pct75);
                })
                .y1(function(d) {
                  return y(d.pct50);
                });

              var medianLine = d3.svg.line()
                .interpolate('basis')
                .x(function(d) {
                  return x(d.date);
                })
                .y(function(d) {
                  return y(d.pct50);
                });

              var lowerInnerArea = d3.svg.area()
                .interpolate('basis')
                .x(function(d) {
                  return x(d.date) || 1;
                })
                .y0(function(d) {
                  return y(d.pct50);
                })
                .y1(function(d) {
                  return y(d.pct25);
                });

              var lowerOuterArea = d3.svg.area()
                .interpolate('basis')
                .x(function(d) {
                  return x(d.date) || 1;
                })
                .y0(function(d) {
                  return y(d.pct25);
                })
                .y1(function(d) {
                  return y(d.pct05);
                });

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
              var svgWidth = width,
                svgHeight = width / 2,
                margin = {
                  top: 10,
                  right: 10,
                  bottom: 10,
                  left: 10
                },
                chartWidth = svgWidth - margin.left - margin.right,
                chartHeight = svgHeight - margin.top - margin.bottom;

              var x = d3.time.scale()
                .range([0, chartWidth])
                .domain(d3.extent(data, function(d) {
                  return d.date;
                }));
              var y;
              if (this.logarithmic) {
                y = d3.scale.log()
                  .range([chartHeight, 0])
                  .domain([this.legendMin, this.legendMax]);

              } else {
                y = d3.scale.linear()
                  .range([chartHeight, 0])
                  .domain([this.legendMin, this.legendMax]);
              }

              var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom')
                .innerTickSize(-chartHeight)
                .outerTickSize(0)
                .tickPadding(10);
              var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .innerTickSize(-chartWidth)
                .outerTickSize(0)
                .tickPadding(10);

              svg.attr('width', chartWidth)
                .attr('height', chartHeight)
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
