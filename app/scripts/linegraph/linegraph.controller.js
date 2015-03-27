(function() {
  'use strict';
  /*
    source: D3 example @ http://bl.ocks.org/rkirsling/33a9e350516da54a5d4f
  */

  function LineGraphController($scope, $window, $timeout, $http, d3Service, Messagebus) {
    this.init = function(element, attrs) {
      var container = element.children[0];
      var hoverContainer, hoverLine, hoverLineXOffset, hoverLineYOffset, hoverLineGroup,
      timeIndicatorLine, timeIndicatorLineXOffset, timeIndicatorLineYOffset, timeIndicatorLineGroup;
      var x, y;

      // used to track if the user is interacting via mouse/finger instead of trying to determine
      // by analyzing various element class names to see if they are visible or not
      var userCurrentlyInteracting = false;
      var currentUserPositionX = -1;

      d3Service.d3().then(function(d3) {
        var renderTimeout;

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
        Messagebus.subscribe('graphMinChange', function(event, value) {
          if (this.legendMin !== value) {
            this.legendMin = value;
          }
        }.bind(this));

        this.legendMax = 50;
        Messagebus.subscribe('graphMaxChange', function(event, value) {
          if (this.legendMax !== value) {
            this.legendMax = value;
          }
        }.bind(this));

        this.logarithmic = false;
        Messagebus.subscribe('logarithmicChange', function(event, value) {
          if (this.logarithmic !== value) {
            this.logarithmic = value;
            this.render(this.data);
          }
        }.bind(this));

        this.selectedUnits = '';
        Messagebus.subscribe('ncwmsUnitsChange', function(event, value) {
          this.selectedUnits = value;
        }.bind(this));

        this.render = function(data) {
          // If we don't pass any data, return out of the element
          if (!data) {
            return;
          }

          if (renderTimeout) {
            clearTimeout(renderTimeout);
          }

          renderTimeout = $timeout(function() {
            // remove all previous items before render
            d3.select(container).selectAll('*').remove();

            // setup variables
            var width = d3.select(element)[0][0].children[0].offsetWidth - margin;

            this.addAxesAndLegend = function(svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
              var legendWidth = 0,
                legendHeight = 0;

              svg.append('clipPath')
                .attr('id', 'axes-clip')
                .append('polygon')
                .attr('points', (-margin.left) + ',' + (-margin.top) + ' ' +
                  (chartWidth - legendWidth - 1) + ',' + (-margin.top) + ' ' +
                  (chartWidth - legendWidth - 1) + ',' + legendHeight + ' ' +
                  (chartWidth + margin.right) + ',' + legendHeight + ' ' +
                  (chartWidth + margin.right) + ',' + (chartHeight + margin.bottom) + ' ' +
                  (-margin.left) + ',' + (chartHeight + margin.bottom));

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
                .text(this.selectedUnits);
            };

            this.drawPaths = function(svg, data, x, y, chartWidth, chartHeight) {
              var pathContainer = svg.append('g');
              //.append('id','')
              //.append('rect')
              //.attr('width', chartWidth)
              //.attr('height', chartHeight);

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

              pathContainer.datum(data);

              pathContainer.append('path')
                .attr('class', 'area upper outer')
                .attr('d', upperOuterArea)
                .attr('clip-path', 'url(#rect-clip)');

              pathContainer.append('path')
                .attr('class', 'area lower outer')
                .attr('d', lowerOuterArea)
                .attr('clip-path', 'url(#rect-clip)');

              pathContainer.append('path')
                .attr('class', 'area upper inner')
                .attr('d', upperInnerArea)
                .attr('clip-path', 'url(#rect-clip)');

              pathContainer.append('path')
                .attr('class', 'area lower inner')
                .attr('d', lowerInnerArea)
                .attr('clip-path', 'url(#rect-clip)');

              pathContainer.append('path')
                .attr('class', 'median-line')
                .attr('d', medianLine)
                .attr('clip-path', 'url(#rect-clip)');

              hoverContainer = container.querySelector('g .lines');

              // add a 'hover' line that we'll show as a user moves their mouse (or finger)
              // so we can use it to show detailed values of each line
              hoverLineGroup = pathContainer.append('g')
                .attr('class', 'hover-line');

              // add the line to the group
              hoverLine = hoverLineGroup
                .append('line')
                .attr('x1', 10).attr('x2', 10) // vertical line so same value on each
                .attr('y1', 0).attr('y2', chartHeight); // top to bottom

              // hide it by default
              hoverLine.classed('hide', true);

              // add a 'time indicator' line that we'll show as time progresses
              timeIndicatorLineGroup = pathContainer.append('g')
                .attr('class', 'time-indicator-line');

              // add the line to the group
              timeIndicatorLine = timeIndicatorLineGroup
                .append('line')
                .attr('x1', 10).attr('x2', 10) // vertical line so same value on each
                .attr('y1', 0).attr('y2', chartHeight); // top to bottom
            };

            this.startTransitions = function(svg, chartWidth, chartHeight, rectClip) {
              rectClip.transition()
                .duration(1000)
                .attr('width', chartWidth);
            };


            this.handleMouseClick = function(event, chartWidth, xAxis) {
              var mouseX = event.pageX - hoverLineXOffset;
              var value = xAxis.invert(mouseX);

              Messagebus.publish('d3TimeSelected', value);
            };

            /**
             * Called when a user mouses over the graph.
             */
            this.handleMouseOverGraph = function(event, chartWidth, chartHeight) {
              var mouseX = event.pageX - hoverLineXOffset;
              var mouseY = event.pageY - hoverLineYOffset;

              //debug('MouseOver graph [' + containerId + '] => x: ' + mouseX + ' y: ' + mouseY + '  height: ' + h + ' event.clientY: ' + event.clientY + ' offsetY: ' + event.offsetY + ' pageY: ' + event.pageY + ' hoverLineYOffset: ' + hoverLineYOffset)
              if (mouseX >= 0 && mouseX <= chartWidth && mouseY >= 0 && mouseY <= chartHeight) {
                // show the hover line
                hoverLine.classed('hide', false);

                // set position of hoverLine
                hoverLine.attr('x1', mouseX).attr('x2', mouseX);

                //displayValueLabelsForPositionX(mouseX)

                // user is interacting
                userCurrentlyInteracting = true;
                currentUserPositionX = mouseX;
              } else {
                // proactively act as if we've left the area since we're out of the bounds we want
                this.handleMouseOutGraph(event);
              }
            };

            /**
             * Called when a user mouses over the graph.
             */
            this.handleTimeChange = function(value) {
              //var temp = new Date(value);
              // set position of timeIndicatorLine
              timeIndicatorLine.attr('x1', x(value)).attr('x2', x(value));
            };

            this.handleMouseOutGraph = function() {
              // hide the hover-line
              hoverLine.classed('hide', true);

              this.setValueLabelsToLatest();

              //debug('MouseOut graph [' + containerId + '] => ' + mouseX + ', ' + mouseY)

              // user is no longer interacting
              userCurrentlyInteracting = false;
              currentUserPositionX = -1;
            };

            /**
             * Set the value labels to whatever the latest data point is.
             */
            this.setValueLabelsToLatest = function(withTransition) {
              //displayValueLabelsForPositionX(w, withTransition);
            };

            this.makeChart = function(data) {
              var svgWidth = width;
              var svgHeight = width / 2;
              var margin = {
                top: 20,
                right: 20,
                bottom: 40,
                left: 40
              };
              var chartWidth = svgWidth - margin.left - margin.right;
              var chartHeight = svgHeight - margin.top - margin.bottom;

              x = d3.time.scale()
                .range([0, chartWidth])
                .domain(d3.extent(data, function(d) {
                  return d.date;
                }));


              if (this.logarithmic) {
                y = d3.scale.log()
                  .range([chartHeight, 0])
                  .domain([1, d3.max(data, function(d) {
                    return d.pct95;
                  })]);

              } else {
                y = d3.scale.linear()
                  .range([chartHeight, 0])
                  .domain([d3.min(data, function(d) {
                    return d.pct95;
                  }), d3.max(data, function(d) {
                    return d.pct95;
                  })]);
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
                //.ticks(4)
                .innerTickSize(-chartWidth)
                .outerTickSize(0)
                .tickPadding(10);

              var svg = d3.select(container).append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

              // clipping to start chart hidden and slide it in later
              var rectClip = svg.append('clipPath')
                .attr('id', 'rect-clip')
                .append('rect')
                .attr('width', 0)
                .attr('height', chartHeight);

              var graphLayer = svg.append('g');

              var overlay = svg.append('rect')
                .attr('class', 'overlay')
                .attr('width', chartWidth)
                .attr('height', chartHeight);

              overlay.on('click', function() {
                this.handleMouseClick(event, chartWidth, x);
              }.bind(this));

              overlay.on('mouseleave', function() {
                this.handleMouseOutGraph();
              }.bind(this));

              overlay.on('mousemove', function() {
                this.handleMouseOverGraph(event, chartWidth, chartHeight);
              }.bind(this));

              Messagebus.subscribe('cesiumTimeSelected', function(event, value) {
                this.handleTimeChange(value);
              }.bind(this));

              // make sure to use offset() and not position() as we want it relative to the document, not its parent
              hoverLineXOffset = margin.left + angular.element(container).offset().left;
              hoverLineYOffset = margin.top + angular.element(container).offset().top;

              // make sure to use offset() and not position() as we want it relative to the document, not its parent
              timeIndicatorLineXOffset = margin.left + angular.element(container).offset().left;
              timeIndicatorLineYOffset = margin.top + angular.element(container).offset().top;

              this.addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
              this.drawPaths(graphLayer, data, x, y, chartWidth, chartHeight);
              this.startTransitions(graphLayer, chartWidth, chartHeight, rectClip);
            };

            this.makeChart(data);
          }.bind(this), 400);
        }.bind(this);
      }.bind(this));
    }.bind(this);
  }

  angular.module('eWaterCycleApp.linegraph').controller('LineGraphController', LineGraphController);
})();
