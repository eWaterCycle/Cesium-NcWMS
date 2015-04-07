'use strict';

describe('logarithmic', function() {
  // load the module
  beforeEach(module('eWaterCycleApp.utils'));
  beforeEach(module('eWaterCycleApp.logarithmic'));

  it('should create an application controller', inject(function($rootScope, $controller) {
    var scope = $rootScope.$new();
    $controller('LogarithmicController', {
      $scope: scope
    });
  }));

  describe('directive', function() {
    var element = '<logarithmic-toggle-directive></logarithmic-toggle-directive>';
    var html;
    var scope;

    beforeEach(function() {
      inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        html = $compile(element)(scope);
        scope.$digest();
      });
    });

    it('should create an element with a button', function() {
      expect(html.html()).toContain('<button ng-click="lc.toggleLogarithmic()"');
    });

    it('should have a data binding to lc.logarithmic', function() {
      expect(html.html()).toContain('ng-class="{active: lc.logarithmic}"');
    });

    it('should create a scope variable (lc.logarithmic) that is false', function() {
      expect(scope.lc.logarithmic).toBeFalsy();
    });
  });

  describe('watchers', function() {
    var scope;
    var ctrl;
    var msgbus;

    beforeEach(function() {
      inject(function($rootScope, $controller, Messagebus) {
        msgbus = Messagebus;
        scope = $rootScope.$new();
        ctrl = $controller('LogarithmicController', {
          $scope: scope
        });
        scope.$digest();
      });
    });

    it('should NOT publish a change to lc.logarithmic to the Messagebus when initialized', function() {
      spyOn(msgbus, 'publish');
      expect(msgbus.publish).not.toHaveBeenCalled();
    });

    it('should publish a change to lc.logarithmic to the Messagebus as "logarithmicChange" when changed', function() {
      spyOn(msgbus, 'publish');

      ctrl.toggleLogarithmic();
      expect(msgbus.publish).toHaveBeenCalledWith('logarithmicChange', true);
      ctrl.toggleLogarithmic();
      expect(msgbus.publish).toHaveBeenCalledWith('logarithmicChange', false);
    });

    it('should listen to the messagebus for changes on "logarithmicChange" and act accordingly', function() {
      scope.$apply(msgbus.publish('logarithmicChange', false));
      expect(ctrl.logarithmic).toBeFalsy();
      scope.$apply(msgbus.publish('logarithmicChange', true));
      expect(ctrl.logarithmic).toBeTruthy();
    });

  });
});
