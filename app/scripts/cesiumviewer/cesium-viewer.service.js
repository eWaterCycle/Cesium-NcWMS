(function() {
  'use strict';

    function CesiumViewerService(Cesium) {
        return {
            init: function(element) {
                this.clock = new Cesium.Clock({
                    multiplier : 500.0
                });
                this.clockViewModel = new Cesium.ClockViewModel(this.clock);
                this.animationViewModel = new Cesium.AnimationViewModel(this.clockViewModel);
                this.animationWidget = new Cesium.Animation('animationContainer', this.animationViewModel);
                this.timelineWidget = new Cesium.Timeline('cesiumTimelineContainer', this.clock);

                this.viewer = new Cesium.Viewer(element.id, {
                    animation : false,
                    baseLayerPicker : false,
                    fullscreenButton : false,
                    geocoder : false,
                    homeButton : false,
                    infoBox : false,
                    sceneModePicker : false,
                    timeline : false,
                    navigationHelpButton : false,
                    navigationInstructionsInitiallyVisible : false,
                    scene3DOnly : false,

                    clock : this.clock,

                    imageryProvider : false,

                    // Use STK High res terrain
                    // terrainProvider : new Cesium.CesiumTerrainProvider({
                    //     url : '//cesiumjs.org/stk-terrain/tilesets/world/tiles',
                    // }),

                    // Start in Globe Viewer
                    sceneMode : Cesium.SceneMode.SCENE3D,

                    creditContainer : 'cesiumCreditsContainer'
                });

                this.mapLayer = this.viewer.scene.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
                    url : '//dev.virtualearth.net',
                    key : 'AsP2TER1bj7tMZGuQtDkvWtX9vOezdG3zbeJp3tOv8d1Q4XrDLd6bEMz_nFsmcKi',
                    mapStyle : Cesium.BingMapsStyle.AERIAL
                }));
            }
        };
    }

  angular.module('eWaterCycleApp.cesiumViewer').service('CesiumViewerService', CesiumViewerService);
})();
