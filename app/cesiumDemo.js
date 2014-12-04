var ncWMSURL = 'http://localhost:8080/ncWMS-2.0-SNAPSHOT/wms?';

var viewer;
var mapLayer;
var colorMapLayer;

function initCesium(withTerrain, $http) {
	var proceed = true;
	if (viewer) {
		proceed = false;
		viewer.destroy();
		while (!viewer.isDestroyed()) {
			sleep(100);
		}
		proceed = true;
	}

	if (proceed) {
		if (withTerrain) {
			viewer = new Cesium.CesiumWidget('cesiumContainer', {
				// Start in Globe Viewer
				sceneMode : Cesium.SceneMode.SCENE3D,

				imageryProvider : false,

				// Use STK High res terrain
				terrainProvider : new Cesium.CesiumTerrainProvider({
					url : '//cesiumjs.org/stk-terrain/tilesets/world/tiles',
				}),

				clock : new Cesium.Clock({
					multiplier : 500.0
				}),

				creditContainer : "cesiumCredits"
			});
		} else {
			viewer = new Cesium.Viewer('cesiumContainer', {
				// Start in Globe Viewer
				sceneMode : Cesium.SceneMode.SCENE3D,

				baseLayerPicker : false,
				animation : false,
				fullscreenButton : false,
				geocoder : false,
				homeButton : false,
				infoBox : false,
				sceneModePicker : false,
				selectionIndicator : false,
				timeline : false,
				navigationHelpButton : false,
				imageryProvider : false,

				clock : new Cesium.Clock({
					multiplier : 500.0
				}),

				creditContainer : "cesiumCredits"
			});
		}

		// Use BingMaps for the base layer
		mapLayer = viewer.scene.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
			url : '//dev.virtualearth.net',
			key : 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
			mapStyle : Cesium.BingMapsStyle.AERIAL
		}));

		addPicking();

		// addCountries($http);
	}

	return viewer;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

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
			viewer.scene.camera.flyTo({
				destination : new Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude),
						viewer.scene.camera.positionCartographic.height)
			});
		}
	}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

	// viewer.handler.setInputAction(function(movement) {
	// var cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition,
	// ellipsoid);
	// if (cartesian) {
	// var cartographic = ellipsoid.cartesianToCartographic(cartesian);
	// label.show = true;
	// label.text = '(' + Cesium.Math.toDegrees(cartographic.longitude).toFixed(2)
	// + ', ' + Cesium.Math.toDegrees(cartographic.latitude).toFixed(2) + ')';
	// label.position = cartesian;
	// }
	// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};

function addCountries($http) {
	$http.get('node_modules/world-countries/countries.json').then(function(res) {
		res.data.forEach(function(country) {
			// console.log(country.cca3.toLowerCase());

			// Create a new GeoJSON data source and add it to the list.
			var dataSource = new Cesium.GeoJsonDataSource();
			viewer.dataSources.add(dataSource);
			var interiorColor = new Cesium.Color(1.0, 1.0, 1.0, 0.0);
			var outlineColor = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
			// Load the document into the data source and then set custom graphics
			dataSource.loadUrl('node_modules/world-countries/data/' + country.cca3.toLowerCase() + '.geo.json').then(function() {
				// Get the array of entities
				var entities = dataSource.entities.entities;
				entities.forEach(function(entity) {
					entity.polygon.material = Cesium.ColorMaterialProperty.fromColor(interiorColor);
					entity.polygon.outlineColor = Cesium.ColorMaterialProperty.fromColor(outlineColor);
				});
			});
		});
	});
}

var myApp = angular.module('myApp', [ 'ui.bootstrap' ]).controller('BodyCtrl', [ '$scope', '$http', '$q', function($scope, $http, $q) {
	// These variables need to be predefined in the scope, because we all
	// use them
	// directly in the (aNGular) HTTP. Where we fill these datastructures
	// or
	// update them, we use the (--NG--) tag in the comments.

	viewer = initCesium(false, $http);

	$scope.ncWMSdata = {
		"metadata" : {},
		"palettes" : []
	};
	$scope.datasets = [];
	$scope.selectedDataset = "default";
	$scope.selectedPalette = "default";
	$scope.selectedTime = new Date(Date.UTC(1960, 0, 31, 0, 0, 0));
	$scope.baseMap = true;
	$scope.logarithmic = false;
	$scope.annotations = false;
	$scope.outlines = false;
	$scope.uncertainty = false;
	$scope.legendMin = 0;
	$scope.legendMax = 50;
	$scope.legendText = [ 10, 20, 30, 40 ];
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

				// Store the first palette we receive as the currently
				// selected
				// palette. (--NG--)
				$scope.selectedPalette = $scope.ncWMSdata.palettes[0];
			}, function error(msg) {
				console.log("Error in getMetadata, " + msg);
			});

			// Define an array to store our waiting promises in
			$scope.httpRequestPromises = [];
			// Do a new metadata request for every loaded dataset
			$scope.datasets.forEach(function(dataset) {
				var promise = $scope.getMetadata(dataset.id).then(function success(resolvedPromise3) {
					$scope.datasets[$scope.datasets.indexOf(dataset)].metaData = resolvedPromise3.data;

					// Once the metadata request is resolved, store the
					// dates with
					// data in
					// the previously made datasets datastructure.
					var dates = [];
					if (resolvedPromise3.data.supportsTimeseries) {
						for ( var year in resolvedPromise3.data.datesWithData) {
							var obj_month = resolvedPromise3.data.datesWithData[year];
							for ( var month in obj_month) {
								var obj_day = obj_month[month];
								for ( var day in obj_day) {
									dates.push(new Date(Date.UTC(year, month, day, 0, 0, 0)));
								}
							}
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
				// $scope.setLegendText($scope.selectedDataset.min,
				// $scope.selectedDataset.max, $scope.logarithmic);
				// $scope.selectedUnits = $scope.selectedDataset.units;

				// Now that everything is loaded, start watching for changes in
				// the settings

				$scope.legendMin = $scope.selectedDataset.min;
				$scope.legendMax = $scope.selectedDataset.max;

				fliplegend($scope.selectedPalette.graphic, "dropdown_canvas");
				bigLegend($scope.selectedPalette.graphic, "bigLegend_canvas");

				setLegendText($scope);
				repaintColorMap($scope);

				$scope.setWatchers();
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
			dataset.children.forEach(function(child) {
				if (child.plottable) {
					result.push({
						id : child.id,
						label : child.label,
						datesWithData : {},
						min : 0.0,
						max : 0.0,
						units : {}
					});
				}
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
			var imgURL2 = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + id + '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + paletteName

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
			if ($scope.logarithmic) {
				$scope.legendMin = 1.0;
				$scope.legendMax = $scope.selectedDataset.max;
			} else {
				$scope.legendMin = $scope.selectedDataset.min;
				$scope.legendMax = $scope.selectedDataset.max;
			}

			repaintColorMap($scope);

			// Fill the array with legend texts
			setLegendText($scope);
			$scope.selectedUnits = $scope.selectedDataset.units;
		});

		// Set a watcher for a change on the selected palette
		// (asynchronously)
		$scope.$watch('selectedPalette', function(newValue, oldValue) {
			repaintColorMap($scope);
			fliplegend($scope.selectedPalette.graphic, "dropdown_canvas");
			bigLegend($scope.selectedPalette.graphic, "bigLegend_canvas");
		});

		// Set a watcher for a change on the logarithmic checkbox
		$scope.$watch('logarithmic', function(newValue, oldValue) {

			if (newValue) {
				$scope.legendMin = 1.0;
				$scope.legendMax = $scope.selectedDataset.max;
			} else {
				$scope.legendMin = $scope.selectedDataset.min;
				$scope.legendMax = $scope.selectedDataset.max;
			}

			repaintColorMap($scope);

			// Fill the array with legend texts
			setLegendText($scope);
			$scope.selectedUnits = $scope.selectedDataset.units;
		});

		// Set a watcher for a change on the uncertainty checkbox
		$scope.$watch('baseMap', function(newValue, oldValue) {
			repaintColorMap($scope);
		});

		// Set a watcher for a change on the uncertainty checkbox
		$scope.$watch('uncertainty', function(newValue, oldValue) {
			repaintColorMap($scope);

			if (newValue == true) {
				$scope.setLegendText(0, 1, false);
				$scope.selectedUnits = "%";
			} else {
				$scope.legendMin = $scope.selectedDataset.min;
				$scope.legendMax = $scope.selectedDataset.max;
			}
		});

		// Set a watcher for a change on the uncertainty checkbox
		$scope.$watch('legendMin', function(newValue, oldValue) {
			repaintColorMap($scope);

			// Fill the array with legend texts
			setLegendText($scope);
			$scope.selectedUnits = $scope.selectedDataset.units;
		});

		// Set a watcher for a change on the uncertainty checkbox
		$scope.$watch('legendMax', function(newValue, oldValue) {
			repaintColorMap($scope);

			// Fill the array with legend texts
			setLegendText($scope);
			$scope.selectedUnits = $scope.selectedDataset.units;
		});

		$scope.timelineWidget.addEventListener('settime', $scope.onTimelineScrub, false);
		$scope.clock.onTick.addEventListener($scope.onTimelineTick);
	}

	// Setter for the selected dataset
	$scope.selectDataset = function(dataset) {
		$scope.selectedDataset = dataset;

		if ($scope.selectedDataset.metaData && $scope.selectedDataset.metaData.supportsTimeseries) {
			var dates = $scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData;

			var startDate = Cesium.JulianDate.fromDate(dates[0]);
			var endDate = Cesium.JulianDate.fromDate(dates[$scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData.length - 1]);

			$scope.timelineWidget.zoomTo(startDate, endDate);
		}

		if ($scope.logarithmic) {
			$scope.legendMin = 1.0;
			$scope.legendMax = $scope.selectedDataset.max;
		} else {
			$scope.legendMin = $scope.selectedDataset.min;
			$scope.legendMax = $scope.selectedDataset.max;
		}

		setLegendText($scope);
		repaintColorMap($scope);
	};

	// Setter for the selected palette
	$scope.selectPalette = function(palette) {
		var oldPalette = $scope.selectedPalette;

		$scope.selectedPalette = palette;

		if (oldPalette !== palette) {
			fliplegend($scope.selectedPalette.graphic, "dropdown_canvas");
			bigLegend($scope.selectedPalette.graphic, "bigLegend_canvas");

			repaintColorMap($scope);
		}
	};

	// Setter for the time (event listener for clicking the time bar).
	$scope.onTimelineScrub = function(e) {
		var oldTime = $scope.selectedTime;

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

		if (oldTime !== closest) {
			repaintColorMap($scope);
		}
	}

	$scope.onTimelineTick = function(clock) {
		var oldTime = $scope.selectedTime;

		var selection = Cesium.JulianDate.toDate($scope.clock.currentTime);
		var closest = $scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData[0];
		$scope.datasets[$scope.datasets.indexOf($scope.selectedDataset)].datesWithData.forEach(function(date) {
			if (date < selection) {
				closest = date;
			}
		});

		if (oldTime != closest && closest !== $scope.selectedTime) {
			$scope.selectedTime = closest;

			repaintColorMap($scope);
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

function setLegendText($scope) {
	var diff = $scope.legendMax - $scope.legendMin;
	var interval = 0.2 * diff;

	if (!$scope.logarithmic) {
		$scope.legendText[3] = Math.round10(($scope.legendMin + interval), -2);
		$scope.legendText[2] = Math.round10(($scope.legendMin + 2 * interval), -2);
		$scope.legendText[1] = Math.round10(($scope.legendMin + 3 * interval), -2);
		$scope.legendText[0] = Math.round10(($scope.legendMin + 4 * interval), -2);
	} else {
		var logmin = Math.log10($scope.legendMin);
		var logmax = Math.log10($scope.legendMax);

		$scope.legendText[3] = Math.round10((Math.pow(10, .8 * logmin + 0.2 * logmax)), -2);
		$scope.legendText[2] = Math.round10((Math.pow(10, .6 * logmin + 0.4 * logmax)), -2);
		$scope.legendText[1] = Math.round10((Math.pow(10, .4 * logmin + 0.6 * logmax)), -2);
		$scope.legendText[0] = Math.round10((Math.pow(10, .2 * logmin + 0.8 * logmax)), -2);
	}
}

function repaintColorMap($scope) {
	var selectedDataset = $scope.selectedDataset;
	var selectedPaletteName = $scope.selectedPalette.name;
	var selectedTime = $scope.selectedTime;
	var logarithmic = $scope.logarithmic;
	var terrain = $scope.baseMap;
	var uncertainty = $scope.uncertainty;
	var selectedMin = $scope.legendMin;
	var selectedMax = $scope.legendMax;

	var selectedlayerName = selectedDataset.id;

	var oldColorMapLayer;
	if (colorMapLayer != null) {
		oldColorMapLayer = colorMapLayer;
	}

	var parameters = {
		service : 'WMS',
		version : '1.3.0',
		request : 'GetMap',
		CRS : 'CRS:84',
		styles : $scope.selectedDataset.metaData.supportedStyles[0] + "/" + selectedPaletteName,
		format : 'image/png',
		LOGSCALE : logarithmic
	};

	if (selectedDataset.metaData) {
		if (selectedDataset.metaData.supportsTimeseries) {
			parameters.TIME = selectedTime.toISOString();
		}

		if (terrain) {
			parameters.TRANSPARENT = 'true';
			parameters.COLORSCALERANGE = logarithmic ? (1 + "," + selectedMax) : (selectedMin + "," + selectedMax);
			parameters.ABOVEMAXCOLOR = 'extend';
			parameters.BELOWMINCOLOR = 'extend';

			colorMapLayer = viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
				url : ncWMSURL,
				layers : selectedlayerName,
				parameters : parameters
			}));

			colorMapLayer.alpha = 0.3;
			colorMapLayer.brightness = 2.0;
		} else {
			if (uncertainty) {
				parameters.TRANSPARENT = 'false';
				parameters.COLORSCALERANGE = (0 + "," + 1);
				parameters.BGCOLOR = '0x000011';
				parameters.ABOVEMAXCOLOR = 'extend';
				parameters.BELOWMINCOLOR = '0x000000';

				colorMapLayer = viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
					url : ncWMSURL,
					layers : selectedlayerName + "Uncertainty",
					parameters : parameters
				}));

				colorMapLayer.alpha = 1.0;
				colorMapLayer.brightness = 2.0;
			} else {
				parameters.TRANSPARENT = 'false';
				parameters.COLORSCALERANGE = logarithmic ? (1 + "," + selectedMax) : (selectedMin + "," + selectedMax);
				parameters.BGCOLOR = '0x000011';
				parameters.ABOVEMAXCOLOR = 'extend';
				parameters.BELOWMINCOLOR = '0x000000';

				colorMapLayer = viewer.scene.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
					url : ncWMSURL,
					layers : selectedlayerName,
					parameters : parameters
				}));

				colorMapLayer.alpha = 1.0;
				colorMapLayer.brightness = 2.0;
			}
		}

		// viewer.scene.imageryLayers.addImageryProvider(provider);

		if (oldColorMapLayer != null) {
			viewer.scene.imageryLayers.remove(oldColorMapLayer, true);
		}
	}
}

myApp.controller('ViewModelCtrl', [ '$scope', '$http', function($scope, $http) {
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
} ]);

myApp.controller('FlyToCtrl', [
		'$scope',
		'$http',
		function($scope, $http) {
			$scope.selectedCountry = "Netherlands";

			$scope.data = {
				"locations" : {}
			};

			// load JSON data
			$http.get('data/countries.json').then(function(res) {
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
		} ]);

myApp.controller('TimeCtrl', [ '$scope', '$http', function($scope, $http) {
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
} ]);

/**
 * Controller for the outline of countries. Loads data from geojson files and
 * sets a watcher for the interface element $scope.outlines
 */
myApp.controller('OutlineCtrl', [ '$scope', '$http', function($scope, $http) {
	$scope.dataSources = [];
	$scope.entities = [];
	$scope.dataSourcesLoaded = false;

	$http.get('node_modules/world-countries/countries.json').then(function(res) {
		res.data.forEach(function(country) {
			// Create a new GeoJSON data source and add it to the list.
			var dataSource = new Cesium.GeoJsonDataSource();
			$scope.dataSources.push(dataSource);

			var interiorColor = new Cesium.Color(1.0, 1.0, 1.0, 0.0);
			var outlineColor = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
			// Load the document into the data source and then set custom graphics
			dataSource.loadUrl('node_modules/world-countries/data/' + country.cca3.toLowerCase() + '.geo.json').then(function() {
				// Get the array of entities
				var entities = dataSource.entities.entities;
				entities.forEach(function(entity) {
					entity.polygon.material = Cesium.ColorMaterialProperty.fromColor(interiorColor);
					entity.polygon.outlineColor = Cesium.ColorMaterialProperty.fromColor(outlineColor);

					$scope.entities.push(entity);
				});
			});
		});
	});

	$scope.$watch('outlines', function(newValue, oldValue) {
		if (!oldValue && newValue) {
			if ($scope.dataSourcesLoaded == false) {
				$scope.dataSources.forEach(function(dataSource) {
					viewer.dataSources.add(dataSource);
				});
				$scope.dataSourcesLoaded = true;
			}

			$scope.entities.forEach(function(entity) {
				entity.polygon.show = new Cesium.ConstantProperty(true);
			});
		} else {
			$scope.entities.forEach(function(entity) {
				entity.polygon.show = new Cesium.ConstantProperty(false);
			});
		}
	});
} ]);

myApp.controller('AnnotationCtrl', [ '$scope', '$http', function($scope, $http) {
	$scope.AnnotationDataSources = [];
	$scope.AnnotationEntities = [];
	$scope.AnnotationDataSourcesLoaded = false;

	var dataSource = new Cesium.GeoJsonDataSource();
	$scope.AnnotationDataSources.push(dataSource);

	dataSource.loadUrl('data/annotations.json').then(function() {
		// Get the array of entities
		var entities = dataSource.entities.entities;
		entities.forEach(function(entity) {
			$scope.AnnotationEntities.push(entity);
		});
	});

	$scope.$watch('annotations', function(newValue, oldValue) {
		if (!oldValue && newValue) {
			if ($scope.AnnotationDataSourcesLoaded == false) {
				$scope.AnnotationDataSources.forEach(function(dataSource) {
					viewer.dataSources.add(dataSource);
				});
				$scope.AnnotationDataSourcesLoaded = true;
			}

			$scope.AnnotationEntities.forEach(function(entity) {
				if (entity.billboard) {
					entity.billboard.show = new Cesium.ConstantProperty(true);
				} else if (entity.polygon) {
					entity.polygon.show = new Cesium.ConstantProperty(true);
				} else if (entity.polyline) {
					entity.polyline.show = new Cesium.ConstantProperty(true);
				}
			});
		} else {
			$scope.AnnotationEntities.forEach(function(entity) {
				if (entity.billboard) {
					entity.billboard.show = new Cesium.ConstantProperty(false);
				} else if (entity.polygon) {
					entity.polygon.show = new Cesium.ConstantProperty(false);
				} else if (entity.polyline) {
					entity.polyline.show = new Cesium.ConstantProperty(false);
				}
			});
		}
	});
} ]);

// myApp.controller('LogarithmicCtrl', [ '$scope', function($scope) {
// // Set a watcher for a change on the logarithmic checkbox
// $scope.$watch('logarithmic', function(newValue, oldValue) {
// if (!oldValue && newValue) {
// $scope.$parent.legendMin = 1.0;
// $scope.$parent.legendMax = $scope.selectedDataset.max;
// } else if (!newValue && oldValue) {
// $scope.$parent.legendMin = $scope.selectedDataset.min;
// $scope.$parent.legendMax = $scope.selectedDataset.max;
// }
//
// if (oldValue !== newValue) {
// setLegendText($scope.$parent);
// repaintColorMap($scope.$parent);
// }
// });
// } ]);

// myApp.controller('BaseMapCtrl', [ '$scope', function($scope) {
// // Set a watcher for a change on the uncertainty checkbox
// $scope.$watch('baseMap', function(newValue, oldValue) {
// if (oldValue !== newValue) {
// repaintColorMap($scope.$parent);
// }
// });
// } ]);
//
// myApp.controller('UncertaintyCtrl', [ '$scope', function($scope) {
// // Set a watcher for a change on the uncertainty checkbox
// $scope.$watch('uncertainty', function(newValue, oldValue) {
//
// if (oldValue !== newValue) {
// setLegendText($scope.$parent);
// repaintColorMap($scope.$parent);
// }
// });
// } ]);

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
