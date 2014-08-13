angular.module('pattyApp', [ 'ui.bootstrap' ]);

var ViewModelCtrl = [ '$scope', '$http', function($scope, $http) {
	$scope.viewModel = "Globe View";
	$scope.selectedCountry = "Netherlands";

	$scope.data = {
		"viewModels" : [ 'Globe View', 'Columbus View', 'Map View' ],
		"locations" : {}
	};
} ];
