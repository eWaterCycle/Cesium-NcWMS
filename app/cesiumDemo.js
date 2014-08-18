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
	})
});

var layers = viewer.scene.imageryLayers;

var palettes = [];
var paletteGraphics = [];

var scaleMin = [];
var scaleMax = [];

var layerNames = [];
var layerIDs = [];

var firstLayerDescription;

var selectedLayerName;
var selectedPaletteName;

var colorMapLayer;

angular.module('myApp', [ 'ui.bootstrap' ]).controller(
		'BodyCtrl',
		[
				'$scope',
				'$http',
				function($scope, $http) {
					$scope.ncWMSdata = {
						"metadata" : {},
						"palettes" : []
					};

					$scope.datasets = [];

					$scope.selectedDataset = "demo";
					$scope.selectedPalette = "demo";

					// First load the available datasets
					$http.get(ncWMSURL + 'item=menu&menu=&REQUEST=GetMetadata').then(
							function(res) {
								$scope.ncWMSdata.metadata = res.data.children;

								// Then check in the first dataset which palettes we have
								$http.get(ncWMSURL + 'item=layerDetails&layerName=' + $scope.ncWMSdata.metadata[0].children[0].id + '&REQUEST=GetMetadata').then(
										function(res) {
											// Get the first picture for the dropdown header
											var imgURL = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + $scope.ncWMSdata.metadata[0].children[0].id
													+ '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + res.data.palettes[0];

											$scope.selectedPalette = {
												name : "dropdown_name",
												graphic : imgURL
											};

											// Flip it (add an onload to it)
											fliplegend(imgURL, "dropdown_canvas");

											// Then do all to fill the dropdown menu
											res.data.palettes.forEach(function(paletteName) {
												// Get the picture
												var imgURL2 = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + $scope.ncWMSdata.metadata[0].children[0].id
														+ '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + paletteName

												// Fill the store
												$scope.ncWMSdata.palettes.push({
													name : paletteName,
													graphic : imgURL2
												});
											});
										});

								// Go through the list of available datasets to construct the
								// menu
								res.data.children.forEach(function(dataset) {
									$scope.datasets.push({
										id : dataset.children[0].id,
										label : dataset.label
									});
								});

								$scope.selectedDataset = $scope.datasets[0];

							});

					$scope.$watch('selectedDataset', function(newValue, oldValue) {
						repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name);
					});

					$scope.$watch('selectedPalette', function(newValue, oldValue) {
						repaintColorMap($scope.selectedDataset.id, $scope.selectedPalette.name);
						fliplegend($scope.selectedPalette.graphic, "dropdown_canvas");
					});

					$scope.selectDataset = function(dataset) {
						$scope.selectedDataset = dataset;
					};
					$scope.selectPalette = function(palette) {
						$scope.selectedPalette = palette;
					};
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

function repaintColorMap(selectedlayerName, selectedPaletteName) {
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
			// LOGSCALE : 'true',
			// COLORSCALERANGE:'1,50950.03',
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
