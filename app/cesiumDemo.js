var ncWMSURL = 'http://localhost:8080/ncWMS/wms?';

var viewer = new Cesium.CesiumWidget('cesiumContainer', {
	// Start in Globe Viewer
	sceneMode : Cesium.SceneMode.SCENE3D,
	// Use STK High res terrain
	terrainProvider : new Cesium.CesiumTerrainProvider({
		url : '//cesiumjs.org/stk-terrain/tilesets/world/tiles',
	}),

	// Use BingMaps for the base layer
	imageryProvider : new Cesium.BingMapsImageryProvider({
		url : '//dev.virtualearth.net',
		key : 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
		mapStyle : Cesium.BingMapsStyle.AERIAL
	}),

	clock : new Cesium.Clock({
		multiplier : 500.0
	// ,
	// clockRange : Cesium.ClockRange.CLAMPED
	}),

	creditContainer : "cesiumCredits"
});

function addPicking() {
	var ellipsoid = viewer.scene.globe.ellipsoid;
	var labels = new Cesium.LabelCollection();
	label = labels.add();
	viewer.scene.primitives.add(labels);

	// Mouse over the globe to see the cartographic position
	viewer.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	viewer.handler.setInputAction(function(doubleclick) {
		var cartesian = viewer.scene.camera.pickEllipsoid(doubleclick.position, ellipsoid);
		if (cartesian) {
			var cartographic = ellipsoid.cartesianToCartographic(cartesian);
			// debugger
			viewer.scene.camera.flyTo({
				destination : new Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), 10000000)
			});
		}
	}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

	viewer.handler.setInputAction(function(movement) {
		var cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
		if (cartesian) {
			var cartographic = ellipsoid.cartesianToCartographic(cartesian);
			label.show = true;
			label.text = '(' + Cesium.Math.toDegrees(cartographic.longitude).toFixed(2) + ', ' + Cesium.Math.toDegrees(cartographic.latitude).toFixed(2) + ')';
			label.position = cartesian;
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};

addPicking();

var layers = viewer.scene.imageryLayers;
// viewer.clock.animating = false;

var colorMapLayer;

// var palettes = [];
// var paletteGraphics = [];
//
// var scaleMin = [];
// var scaleMax = [];
//
// var layerNames = [];
// var layerIDs = [];
//
// var firstLayerDescription;
//
// var selectedLayerName;
// var selectedPaletteName;
//

angular.module('myApp', [ 'ui.bootstrap' ]).controller(
		'BodyCtrl',
		[
				'$scope',
				'$http',
				'$q',
				function($scope, $http, $q) {
					// These variables need to be predefined in the scope, because we all
					// use them
					// directly in the (aNGular) HTTP. Where we fill these datastructures
					// or
					// update them, we use the (--NG--) tag in the comments.
					$scope.ncWMSdata = {
						"metadata" : {},
						"palettes" : []
					};
					$scope.datasets = [];
					$scope.selectedDataset = "default";
					$scope.selectedPalette = "default";
					$scope.selectedTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
					$scope.logarithmic = false;
					$scope.legendText = [ 00, 10, 20, 30, 40, 50 ];
					$scope.selectedUnits = "";

					$scope.clock = viewer.clock;
					$scope.clockViewModel = new Cesium.ClockViewModel($scope.clock);
					$scope.animationViewModel = new Cesium.AnimationViewModel($scope.clockViewModel);
					$scope.animationWidget = new Cesium.Animation('animationContainer', $scope.animationViewModel);
					$scope.timelineWidget = new Cesium.Timeline('cesiumTimeline', $scope.clock);

					$scope.loadData = function() {
						// Ask the server to give us the data we need to get started, in
						// this case
						// an overview of the available datasets
						$scope.getMenu().then(function success(resolvedPromise1) {
							// Build an array containing our datasets (--NG--)
							$scope.datasets = $scope.loadMenu(resolvedPromise1);
							// Store the first dataset as our 'currently selected' dataset
							// (--NG--)
							$scope.selectedDataset = $scope.datasets[0];

							// Get the id of the first dataset we got from the server,
							// because we can
							// only get some information out of the server if we dig a
							// little deeper,
							// and we need an ID to do just that.
							var firstDatasetID = resolvedPromise1.data.children[0].children[0].id;

							// To get the server to give us the available palette names,
							// we use this
							// first ID
							$scope.getMetadata(firstDatasetID).then(function success(resolvedPromise2) {
								// Store the palette names and image URL's. (--NG--)
								$scope.ncWMSdata.palettes = $scope.loadPalettes(firstDatasetID, resolvedPromise2.data.palettes);

								// Store the first pallette we receive as the currently
								// selected
								// palette. (--NG--)
								$scope.selectedPalette = $scope.ncWMSdata.palettes[0];
								$scope.setWatchers();
							}, function error(msg) {
								console.log("Error in getMetadata, " + msg);
							});

							// Define an array to store our waiting promises in
							$scope.httpRequestPromises = [];
							// Do a new metadata request for every loaded dataset
							$scope.datasets.forEach(function(dataset) {
								var promise = $scope.getMetadata(dataset.id).then(function success(resolvedPromise3) {
									// Once the metadata request is resolved, store the
									// dates with
									// data in
									// the previously made datasets datastructure.
									var dates = [];
									for ( var year in resolvedPromise3.data.datesWithData) {
										var obj_month = resolvedPromise3.data.datesWithData[year];
										for ( var month in obj_month) {
											var day = obj_month[month];
											dates.push(new Date(Date.UTC(year, month, day)));
										}
									}
									$scope.datasets[$scope.datasets.indexOf(dataset)].datesWithData = dates;

									// Store the scale ranges
									$scope.datasets[$scope.datasets.indexOf(dataset)].min = parseFloat(resolvedPromise3.data.scaleRange[0]);
									$scope.datasets[$scope.datasets.indexOf(dataset)].max = parseFloat(resolvedPromise3.data.scaleRange[1]);

									$scope.datasets[$scope.datasets.indexOf(dataset)].units = resolvedPromise3.data.units;

								}, function error(msg) {
									console.log("Error in getMetadata, " + msg);
								});
								// Add this promise to the array of waiting promises.
								$scope.httpRequestPromises.push(promise);
							})

							// The $q service lets us wait for an array of promises to be
							// resolved
							// before continuing. We wait here until all the promises for
							// the metadata
							// requests for each dataset are complete.
							$q.all($scope.httpRequestPromises).then(function() {
								var dates = $scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData;

								var startDate = Cesium.JulianDate.fromDate(dates[0]);
								var endDate = Cesium.JulianDate.fromDate(dates[$scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData.length - 1]);

								$scope.timelineWidget.zoomTo(startDate, endDate);

								// Fill the array with legend texts
								$scope.setLegendText($scope.selectedDataset.min, $scope.selectedDataset.max, $scope.logarithmic);
								$scope.selectedUnits = parseFloat($scope.selectedDataset.units);
							});

						}, function error(msg) {
							console.log("Error in getMenu, " + msg);
						});
					}

					$scope.getMenu = function() {
						return $http.get(ncWMSURL + 'item=menu&menu=&REQUEST=GetMetadata');
					}

					$scope.loadMenu = function(res) {
						var result = [];

						$scope.ncWMSdata.metadata = res.data.children;
						$scope.ncWMSdata.metadata.forEach(function(dataset) {
							result.push({
								id : dataset.children[0].id,
								label : dataset.label,
								datesWithData : {},
								min : 0.0,
								max : 0.0,
								units : {}
							});
						});

						return result;
					}

					$scope.getMetadata = function(id) {
						return $http.get(ncWMSURL + 'item=layerDetails&layerName=' + id + '&REQUEST=GetMetadata');
					}

					$scope.loadPalettes = function(id, res) {
						var result = [];

						res.forEach(function(paletteName) {
							var imgURL2 = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + id + '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE='
									+ paletteName

							result.push({
								name : paletteName,
								graphic : imgURL2
							});
						});

						return result;
					}

					$scope.loadData();

					$scope.setWatchers = function() {
						// Set a watcher for a change on the selected dataset
						// (asynchronously)
						$scope.$watch('selectedDataset', function(newValue, oldValue) {
							repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic, $scope.selectedDataset.min,
									$scope.selectedDataset.max);

							// Fill the array with legend texts
							$scope.setLegendText($scope.selectedDataset.min, $scope.selectedDataset.max, $scope.logarithmic);
							$scope.selectedUnits = parseFloat($scope.selectedDataset.units);
						});

						// Set a watcher for a change on the selected palette
						// (asynchronously)
						$scope.$watch('selectedPalette', function(newValue, oldValue) {
							repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic, $scope.selectedDataset.min,
									$scope.selectedDataset.max);
							fliplegend($scope.selectedPalette.graphic, "dropdown_canvas");
							bigLegend($scope.selectedPalette.graphic, "bigLegend_canvas");
						});

						// Set a watcher for a change on the logarithmic checkbox
						$scope.$watch('logarithmic', function(newValue, oldValue) {
							repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic, $scope.selectedDataset.min,
									$scope.selectedDataset.max);

							$scope.setLegendText($scope.selectedDataset.min, $scope.selectedDataset.max, $scope.logarithmic);
							$scope.selectedUnits = parseFloat($scope.selectedDataset.units);
						});

						$scope.timelineWidget.addEventListener('settime', $scope.onTimelineScrub, false);
						$scope.clock.onTick.addEventListener($scope.onTimelineTick);
					}

					// Setter for the selected dataset
					$scope.selectDataset = function(dataset) {
						$scope.selectedDataset = dataset;
					};

					// Setter for the selected palette
					$scope.selectPalette = function(palette) {
						$scope.selectedPalette = palette;
					};

					// Setter for the time (event listener for clicking the time bar).
					$scope.onTimelineScrub = function(e) {
						$scope.clock.currentTime = e.timeJulian;
						$scope.clock.shouldAnimate = false;

						var selection = Cesium.JulianDate.toDate($scope.clock.currentTime);
						var closest = $scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData[0];
						$scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData.forEach(function(date) {
							if (date < selection) {
								closest = date;
							}
						});

						$scope.selectedTime = closest;

						repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic, $scope.selectedDataset.min,
								$scope.selectedDataset.max);
					}

					$scope.onTimelineTick = function(clock) {
						var selection = Cesium.JulianDate.toDate($scope.clock.currentTime);
						var closest = $scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData[0];
						$scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData.forEach(function(date) {
							if (date < selection) {
								closest = date;
							}
						});

						if (closest !== $scope.selectedTime) {
							console.log("tick forward!");

							$scope.selectedTime = closest;

							repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic, $scope.selectedDataset.min,
									$scope.selectedDataset.max);
						}
					}

					$scope.setLegendText = function(min, max, log) {
						var diff = max - min;
						if (!log) {
							var interval = 0.2 * diff;

							$scope.legendText[5] = Math.round10(min, -2);
							$scope.legendText[4] = Math.round10(min + interval, -2);
							$scope.legendText[3] = Math.round10(min + 2 * interval, -2);
							$scope.legendText[2] = Math.round10(min + 3 * interval, -2);
							$scope.legendText[1] = Math.round10(min + 4 * interval, -2);
							$scope.legendText[0] = Math.round10(max, -2);
						} else {
							var logmin = Math.log(1);
							var logmax = Math.log(max);

							$scope.legendText[5] = (Math.pow(10, logmin)).toExponential(2);
							$scope.legendText[4] = (Math.pow(10, .8 * logmin + 0.2 * logmax)).toExponential(2);
							$scope.legendText[3] = (Math.pow(10, .6 * logmin + 0.4 * logmax)).toExponential(2);
							$scope.legendText[2] = (Math.pow(10, .4 * logmin + 0.6 * logmax)).toExponential(2);
							$scope.legendText[1] = (Math.pow(10, .2 * logmin + 0.8 * logmax)).toExponential(2);
							$scope.legendText[0] = (Math.pow(10, logmax)).toExponential(2);
						}
					}

				} ]).directive('iAmLegend', function() {
	return {
		restrict : "A",
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
			}
		}
	};
});

function fliplegend(imgURL, elementID) {
	var context = document.getElementById(elementID).getContext("2d");
	var img = new Image();
	img.src = imgURL;

	img.onload = function() {
		context.canvas.width = 150;
		context.canvas.height = 10;

		context.translate(150, 0);
		context.rotate(-1.5 * Math.PI);
		context.drawImage(img, 0, 0);
	}
}

function bigLegend(imgURL, elementID) {
	var context = document.getElementById(elementID).getContext("2d");
	var img = new Image();
	img.src = imgURL;

	img.onload = function() {
		context.canvas.width = 10;
		context.canvas.height = 150;

		context.drawImage(img, 0, 0);
	}
}

function repaintColorMap(selectedlayerName, selectedPaletteName, selectedTime, logarithmic, selectedMin, selectedMax) {
	if (colorMapLayer != null) {
		layers.remove(colorMapLayer, false);
	}

	colorMapLayer = layers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
		url : ncWMSURL,
		layers : selectedlayerName,
		parameters : {
			service : 'WMS',
			version : '1.3.0',
			request : 'GetMap',
			CRS : 'CRS:84',
			TRANSPARENT : 'true',
			TIME : selectedTime.toISOString(),
			LOGSCALE : logarithmic,
			COLORSCALERANGE : logarithmic ? (1 + "," + selectedMax) : (selectedMin + "," + selectedMax),
			ABOVEMAXCOLOR : 'extend',
			BELOWMINCOLOR : 'extend',
			styles : 'boxfill/' + selectedPaletteName,
			format : 'image/png'
		}
	}));

	colorMapLayer.alpha = 0.3;
	colorMapLayer.brightness = 2.0;
}

var ViewModelCtrl = [ '$scope', '$http', function($scope, $http) {
	$scope.viewModel = "Globe View";

	$scope.data = {
		"viewModels" : [ 'Globe View', 'Columbus View', 'Map View' ]
	};

	$scope.selectViewModel = function(item) {
		$scope.viewModel = item;
		if (item == 'Globe View') {
			viewer.scene.morphTo3D(2.0);
		} else if (item == 'Columbus View') {
			viewer.scene.morphToColumbusView(2.0);
		} else if (item == 'Map View') {
			viewer.scene.morphTo2D(2.0);
		}
	}
} ];

var FlyToCtrl = [
		'$scope',
		'$http',
		function($scope, $http) {
			$scope.selectedCountry = "Netherlands";

			$scope.data = {
				"locations" : {}
			};

			// load JSON data
			$http.get('countries.json').then(function(res) {
				$scope.data.locations.countries = res.data;
				$scope.flyToCountry($scope.selectedCountry, true);
			});

			$scope.selectCountry = function(item) {
				$scope.selectedCountry = item;
				$scope.flyToCountry(item, false);
			}

			$scope.flyToCountry = function(countryToFlyTo, defaultHeight) {
				for (country in $scope.data.locations.countries) {
					var location = $scope.data.locations.countries[country];
					if (location.country == countryToFlyTo) {
						viewer.scene.camera.flyTo({
							destination : Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, defaultHeight ? 10000000 : Math.max(location.area / Math.PI,
									1000000))
						});
					}
				}
			}
		} ];

var TimeCtrl = [ '$scope', '$http', function($scope, $http) {
	// $("#slider").dateRangeSlider();
	// $scope.currentTime = {};
	//
	// $scope.data = {
	// dataset : {},
	// timesAvailable : []
	// };
	//
	// $scope.selectViewModel = function(item) {
	// $scope.viewModel = item;
	// if (item == 'Globe View') {
	// viewer.scene.morphTo3D(2.0);
	// } else if (item == 'Columbus View') {
	// viewer.scene.morphToColumbusView(2.0);
	// } else if (item == 'Map View') {
	// viewer.scene.morphTo2D(2.0);
	// }
	// }
} ];

/**
 * Decimal adjustment of a number.
 * 
 * @param {String}
 *          type The type of adjustment.
 * @param {Number}
 *          value The number.
 * @param {Integer}
 *          exp The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
	// If the exp is undefined or zero...
	if (typeof exp === 'undefined' || +exp === 0) {
		return Math[type](value);
	}
	value = +value;
	exp = +exp;
	// If the value is not a number or the exp is not an integer...
	if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
		return NaN;
	}
	// Shift
	value = value.toString().split('e');
	value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
	// Shift back
	value = value.toString().split('e');
	return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

// Decimal round
if (!Math.round10) {
	Math.round10 = function(value, exp) {
		return decimalAdjust('round', value, exp);
	};
}
// Decimal floor
if (!Math.floor10) {
	Math.floor10 = function(value, exp) {
		return decimalAdjust('floor', value, exp);
	};
}
// Decimal ceil
if (!Math.ceil10) {
	Math.ceil10 = function(value, exp) {
		return decimalAdjust('ceil', value, exp);
	};
}
