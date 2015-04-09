(function() {
  'use strict';

  function helpDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/help/help.directive.html',
      controller: 'HelpController',
      controllerAs: 'hc'
    };
  }

  angular.module('eWaterCycleApp.help').directive('helpDirective', helpDirective);
})();
