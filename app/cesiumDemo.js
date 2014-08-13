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

var BodyCtrl = [
		'$scope',
		'$http',
		function($scope, $http) {
			$scope.ncWMSdata = {
				"datasets" : [],
				"metadata" : {},
				"paletteGraphics" : []
			};

			$scope.selectedDataset = "demo";
			$scope.selectedID = "demo";
			$scope.selectedPalette = "demo";

			// First load the available datasets
			$http.get(ncWMSURL + 'item=menu&menu=&REQUEST=GetMetadata').then(
					function(res) {
						$scope.ncWMSdata.metadata = res.data.children;

						$scope.selectedDataset = res.data.children[0];

						// Then check in the first dataset which palettes we have
						$http.get(ncWMSURL + 'item=layerDetails&layerName=' + $scope.ncWMSdata.metadata[0].children[0].id + '&REQUEST=GetMetadata').then(
								function(res) {
									// Get the first picture for the dropdown header
									var imgURL = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + $scope.ncWMSdata.metadata[0].children[0].id
											+ '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + res.data.palettes[0];

									$scope.selectedPalette = {
										name : "dropdown_name",
										html : "<canvas id='dropdown_canvas' style='width: 150px; height: 10px;'></canvas>",
										graphic : imgURL
									};

									// Flip it (add an onload to it)
									fliplegend(imgURL, "dropdown_canvas");

									// Then do all to fill the dropdown menu
									res.data.palettes.forEach(function(paletteName) {
										// Get the picture
										var imgURL = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + $scope.ncWMSdata.metadata[0].children[0].id
												+ '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + paletteName

										// Fill the store
										$scope.ncWMSdata.paletteGraphics.push({
											name : paletteName,
											html : "<canvas id='" + paletteName + "_canvas' style='width: 150px; height: 10px;'></canvas>" + "<script>fliplegend(" + imgURL + ", "
													+ paletteName + "_canvas)</script>",
											graphic : imgURL
										});

									});
								});

						// Go through the list of available datasets to construct the menu
						res.data.children.forEach(function(dataset) {
							$scope.ncWMSdata.datasets.push({
								label : dataset.label,
								id : dataset.children[0].id
							});
						});
					}).then(function() {
				$scope.ncWMSdata.paletteGraphics.forEach(function(paletteName) {
					fliplegend($scope.ncWMSdata.paletteGraphics.graphic, paletteName + "_canvas");
				});
			});
			$scope.selectDataset = function(dataset) {
				$scope.selectedDataset = dataset;
				repaintColorMap(dataset.id, $scope.selectedPalette);
			};
			$scope.selectPalette = function(palette) {
				$scope.selectedPalette = palette;
				repaintColorMap($scope.selectedDataset.id, palette.name);
			};
		} ];

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

function doCesiumJSON() {
	Cesium.loadJson(ncWMSURL + 'item=menu&menu=&request=GetMetadata').then(
			function(jsonData) {
				$("#dropVariable").text(jsonData.children[0].children[0].id);
				firstLayerDescription = jsonData.children[0].children[0].id;
				selectedlayerName = firstLayerDescription;

				// colorMapLayer = layers.addImageryProvider(new
				// Cesium.WebMapServiceImageryProvider({
				// url : ncWMSURL,
				// layers : firstLayerDescription
				// }));

				jsonData.children.forEach(function(dataset) {
					dataset.children.forEach(function(layerMetaData) {
						var layerName = layerMetaData.id;
						layerNames[layerNames.length] = layerName;

						var layerID = layerIDs.length;
						layerIDs[layerIDs.length] = layerID;

						$("#menuVariable").append(
								"<li role='presentation'><a role='menuitem' tabindex='-1' href='#' id='LayerButton_" + layerID + "'>" + layerName + "</a></li>");
					});
				});
			}, function(error) {
				console.log("error initial JSON call");
			}).then(function() {
		loadPaletteNames(firstLayerDescription);

		layerIDs.forEach(function(layerID) {
			$('#LayerButton_' + layerID).click(function() {

				console.log("clicked " + layerNames[layerID]);
				selectedlayerName = layerNames[layerID];

				$("#dropVariable").text(selectedlayerName);

				repaintColorMap();
			});
		});

		repaintColorMap();
	});

	function loadPaletteNames(firstLayerDescription) {
		var jsonURLPRE = ncWMSURL + 'item=layerDetails&layerName=';
		var jsonURLPOST = '&request=GetMetadata';
		var jsonURL = jsonURLPRE.concat(firstLayerDescription).concat(jsonURLPOST);

		Cesium.loadJson(jsonURL).then(function(paletteJSON) {
			palettes = paletteJSON.palettes;

		}, function(error) {
			console.log("error palette JSON call");
		}).then(function() {
			loadPaletteGraphics(firstLayerDescription);
		});
	}

	function loadPaletteGraphics(firstLayerDescription) {
		var imgURLPRE = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + firstLayerDescription;
		var imgURLPOST = '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + palettes[0];
		var imgURL = imgURLPRE.concat(imgURLPOST);

		$("#dropPalette").html("<canvas id='dropPalette_graphic'></canvas>");
		fliplegend(imgURL, "dropPalette_graphic");
		selectedPaletteName = palettes[0];

		palettes.forEach(function(paletteName) {
			var imgURLPRE = ncWMSURL + 'REQUEST=GetLegendGraphic&LAYER=' + firstLayerDescription;
			var imgURLPOST = '&COLORBARONLY=true&WIDTH=10&HEIGHT=150&NUMCOLORBANDS=250&PALETTE=' + paletteName;
			var imgURL = imgURLPRE.concat(imgURLPOST);

			$("#menuPalette").append(
					"" + "<li role='presentation'>" + "  <a role='menuitem' tabindex='-1' href='#' class='legendMenuItem' id='PaletteButton_" + paletteName + "'>"
							+ "    	 <canvas id='pal_" + paletteName + "'></canvas>" + "  </a>" + "</li>");

			$('#PaletteButton_' + paletteName).click(function() {
				console.log("clicked " + paletteName);

				$("#dropPalette").html("<canvas id='dropPalette_graphic'></canvas>");
				fliplegend(imgURL, "dropPalette_graphic");

				selectedPaletteName = paletteName;

				repaintColorMap();
			});

			fliplegend(imgURL, "pal_" + paletteName);
		});

	}

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

	function repaintColorMap() {
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

	function determineScales() {
		var jsonURLPRE = ncWMSURL + 'item=layerDetails&layerName=';
		var jsonURLPOST = '&request=GetMetadata';

		layerDescriptions.forEach(function(layerDescription) {
			var jsonURL = jsonURLPRE.concat(layerDescription).concat(jsonURLPOST);

			Cesium.loadJson(jsonURL).then(function(layerJSON) {
				scaleMin[scaleMin.length] = layerJSON.scaleRange[0];
				scaleMax[scaleMax.length] = layerJSON.scaleRange[1];
			}, function(error) {
				console.log("error scale JSON call");
			}).then(function() {
				if (scaleMin.length == layerDescriptions.length) {
					everythingLoaded();
				}
			});
		});
	}
}

angular.module('myApp', [ 'ui.bootstrap' ]);

var ViewModelCtrl = [
		'$scope',
		'$http',
		function($scope, $http) {
			$scope.viewModel = "Globe View";
			$scope.selectedCountry = "Netherlands";

			$scope.data = {
				"viewModels" : [ 'Globe View', 'Columbus View', 'Map View' ],
				"locations" : {}
			};

			// load JSON data
			$http.get('countries.json').then(function(res) {
				$scope.data.locations.countries = res.data;
				$scope.flyToCountry($scope.selectedCountry, true);
			});

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
var DataCtrl = [
		'$scope',
		'$http',
		function($scope, $http) {
			$scope.data = {
				"datasets" : {},
				"locations" : {}
			};

			// load JSON data
			// $http.get(ncWMSURL +
			// 'item=menu&menu=&request=GetMetadata').then(function(res) {
			// $scope.data.datasets = res.children[0]
			// });

			$scope.selectedDataset = $scope.data.datasets[0];
			// $scope.selectedCountry = "Netherlands";

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