//function loadScript(url, callback) {
	//var viewer = new Cesium.Viewer('cesiumContainer');
  	/*
    var viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider : new Cesium.ArcGisMapServerImageryProvider({
            url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        }),
        baseLayerPicker : false
    });
    var layers = viewer.scene.imageryLayers;
    var blackMarble = layers.addImageryProvider(new Cesium.TileMapServiceImageryProvider({
        url : '//cesiumjs.org/tilesets/imagery/blackmarble',
        maximumLevel : 8,
        credit : 'Black Marble imagery courtesy NASA Earth Observatory'
    }));
    blackMarble.alpha = 0.3; // 0.0 is transparent.  1.0 is opaque.
    blackMarble.brightness = 2.0; // > 1.0 increases brightness.  < 1.0 decreases.
    */
/*  
  	var ncWMSURL = 'http://localhost:8080/ncWMS/wms?';
  
  	var layerDescriptions = [];  
  	var palettes = [];  	
  	var scaleMin = [];
  	var scaleMax = [];
  	
  	Cesium.loadJson(ncWMSURL+'item=menu&menu=&request=GetMetadata').then(function(jsonData) {
  		jsonData.children.forEach(function(dataset) {
  			dataset.children.forEach(function(layerMetaData) {
  				var variableID = layerMetaData.id;
  				layerDescriptions[layerDescriptions.length] = variableID;
  			});
		});			
	}, function(error) {
		    console.log("error initial JSON call");
	}).then(function() {		  		
		loadPalettes(layerDescriptions[0]);
	});
  	
	function loadPalettes(firstLayerDescription) {		
	  	var jsonURLPRE = ncWMSURL+'item=layerDetails&layerName=';
	  	var jsonURLPOST = '&request=GetMetadata';	  	
	  	var jsonURL = jsonURLPRE.concat(firstLayerDescription).concat(jsonURLPOST);
			  	
		Cesium.loadJson(jsonURL).then(
			function(paletteJSON) {
				palettes = paletteJSON.palettes;
			}, function(error) {
				console.log("error palette JSON call");
			}
		).then(function() {
			determineScales();
		});
	}
  	
  	function determineScales() {		
	  	var jsonURLPRE = ncWMSURL+'item=layerDetails&layerName=';
	  	var jsonURLPOST = '&request=GetMetadata';
	  	
	  	layerDescriptions.forEach(function(layerDescription) {
	  		var jsonURL = jsonURLPRE.concat(layerDescription).concat(jsonURLPOST);
		  	
		  	Cesium.loadJson(jsonURL).then(
				function(layerJSON) {
					scaleMin[scaleMin.length] = layerJSON.scaleRange[0];
					scaleMax[scaleMax.length] = layerJSON.scaleRange[1];					
				}, function(error) {
					console.log("error scale JSON call");
				}
			).then(function() {
				if (scaleMin.length == layerDescriptions.length) {
					everythingLoaded();
				}
			});
	  	});	  	
  	}
  	
  	function everythingLoaded() {
  		//debugger
  	}
*/   	
//  	var widget = new Cesium.Viewer('cesiumContainer', {
//  	    sceneMode : Cesium.SceneMode.SceneMode.SCENE3D,
//  	    terrainProvider : new Cesium.CesiumTerrainProvider({
//  	        url : '//cesiumjs.org/smallterrain',
//  	        credit : 'Terrain data courtesy Analytical Graphics, Inc.'
//  	    }),
//  		baseLayerPicker : false,
//  		imageryProvider : new TileMapServiceImageryProvider({
//            url : buildModuleUrl('Assets/Textures/NaturalEarthII')
//        })
//  	});
  	
  	var viewer = new Cesium.Viewer('cesiumContainer', {
  	    //Start in Globe Viewer
  	    sceneMode : Cesium.SceneMode.SCENE3D,
  	    //Use STK High res terrain
  	    terrainProvider : new Cesium.CesiumTerrainProvider({
  	    	url : '//cesiumjs.org/stk-terrain/tilesets/world/tiles',
        }),
        
  	    //Hide the base layer picker
  	    baseLayerPicker : false,
  	    
  	    //Use BingMaps for the base layer
  	    imageryProvider : new Cesium.BingMapsImageryProvider({
            url : '//dev.virtualearth.net',
            key : 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
            mapStyle : Cesium.BingMapsStyle.AERIAL
        })
  	});
  	
/*  	
  	var parameters = new Object({
        service : 'WMS',
        version : '1.3.0',
        srs : '',
        crs : 'CRS:84',
        transparent : true,
        request : 'GetMap',
        styles : 'boxfill/hotres',
        //logscale : true,
        //colorscalerange : '1,120000',
        //colorscalerange : '1,120000',
        format : 'image/png',
        abovemaxcolor : 'extend',
        belowmincolor : 'extend'
    });
    var ncWMSProvider = new Cesium.WebMapServiceImageryProvider({
        url : 'http://localhost:8080/ncWMS/wms',
        //layers : '1/disChanWaterBody',
        //layers : '2/discharge',
        layers : '3/gwRecharge',       
        //layers : '2/discharge',       
        //layers : '2/discharge',       
        //layers : '2/discharge',       
    	
    	parameters: parameters
    });
    var layers = widget.scene.globe.imageryLayers;
		//layers.removeAll();
		
    var eWaterCycle = layers.addImageryProvider(ncWMSProvider);
    eWaterCycle.alpha = 0.3;
    eWaterCycle.brightness = 2.0;
*/    
//}