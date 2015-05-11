(function() {
  'use strict';

  function HelpModalController(UserAgent) {
    this.mobile = UserAgent.mobile;

    this.init = function() {
      angular.element('#helpModal').modal(
        {          
          'show' : 'true'
        }
      );
    };
  }

  angular.module('eWaterCycleApp.helpModal').controller('HelpModalController', HelpModalController);
})();
