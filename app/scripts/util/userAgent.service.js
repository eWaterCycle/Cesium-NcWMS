(function() {
  'use strict';

  function UserAgent($window) {
    //Check for user agent
    this.isMobile = {
      Android: function() {
          return $window.navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
          return $window.navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
          return $window.navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
          return $window.navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
          return $window.navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
          return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
      }
    };

    this.mobile = this.isMobile.any()? true : false;
  }

  angular.module('eWaterCycleApp.utils').service('UserAgent', UserAgent);
})();
