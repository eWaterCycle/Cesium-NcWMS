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

angular.module('myApp', [ 'ui.bootstrap' ]).controller('BodyCtrl', [ '$scope', '$http', '$q', function($scope, $http, $q) {
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

				// Store the first pallette we receive as the currently selected
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
					// Once the metadata request is resolved, store the dates with data in
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
				datesWithData : {}
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
			repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic);
		});

		// Set a watcher for a change on the selected palette
		// (asynchronously)
		$scope.$watch('selectedPalette', function(newValue, oldValue) {
			repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic);
			fliplegend($scope.selectedPalette.graphic, "dropdown_canvas");
		});

		// Set a watcher for a change on the selected palette
		// (asynchronously)
		$scope.$watch('logarithmic', function(newValue, oldValue) {
			repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic);
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

		repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic);
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

			repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name, $scope.selectedTime, $scope.logarithmic);
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

function repaintColorMap(selectedlayerName, selectedPaletteName, selectedTime, logarithmic) {
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
			COLORSCALERANGE : '1,50950.03',
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
