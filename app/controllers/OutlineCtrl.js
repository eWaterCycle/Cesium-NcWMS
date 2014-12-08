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